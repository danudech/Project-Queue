param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$configLine = Get-Content -LiteralPath (Join-Path $projectRoot 'Api/.env') | Where-Object { $_ -match '^\s*ConnectionStrings__Default\s*=' } | Select-Object -First 1
if (-not $configLine) { throw 'ConnectionStrings__Default is missing from Api/.env.' }
$connectionString = ($configLine -split '=', 2)[1].Trim().Trim('"').Trim("'")
$connection = [System.Data.SqlClient.SqlConnection]::new($connectionString)
$connection.Open()
try {
    $command = $connection.CreateCommand()
    $command.CommandText = @'
SELECT t.name+'.'+c.name AS ColumnName,
       ty.name + CASE WHEN ty.name IN ('nvarchar','nchar') THEN '('+CASE WHEN c.max_length=-1 THEN 'max' ELSE CAST(c.max_length/2 AS varchar(10)) END+')'
       WHEN ty.name IN ('varchar','char','varbinary','binary') THEN '('+CASE WHEN c.max_length=-1 THEN 'max' ELSE CAST(c.max_length AS varchar(10)) END+')'
       WHEN ty.name IN ('decimal','numeric') THEN '('+CAST(c.precision AS varchar(10))+','+CAST(c.scale AS varchar(10))+')' ELSE '' END AS StoreType,
       c.is_nullable
FROM sys.tables t JOIN sys.columns c ON t.object_id=c.object_id JOIN sys.types ty ON c.user_type_id=ty.user_type_id;
'@
    $reader = $command.ExecuteReader()
    $actual = @{}
    while ($reader.Read()) { $actual[$reader.GetString(0)] = @{ Type = $reader.GetString(1); Nullable = $reader.GetBoolean(2) } }
    $reader.Close()
    $migrationIds = @('20260803033902_InitialFullSchema', '20260807120000_AddServiceImages', '20260807170000_AddChatTables')
    $mismatches = [System.Collections.Generic.List[string]]::new()
    $checked = 0
    foreach ($migrationId in @($migrationIds[0], $migrationIds[2])) {
        $source = Get-Content -LiteralPath (Join-Path $projectRoot "Infrastructure/Migrations/$migrationId.cs") -Raw
        $tables = [regex]::Matches($source, '(?s)(?:migrationBuilder|migrationBuilder).CreateTable\(\s*name: "([^"]+)",\s*columns: table => new\s*\{(.*?)\n\s*\},\s*constraints:')
        if ($tables.Count -eq 0) { throw "No table definitions found in $migrationId." }
        foreach ($table in $tables) {
            $columns = [regex]::Matches($table.Groups[2].Value, '(?m)^\s*(\w+) = table.Column<[^>]+>\(type: "([^"]+)"[^\r\n]*?nullable: (true|false)')
            foreach ($column in $columns) {
                $key = $table.Groups[1].Value+'.'+$column.Groups[1].Value
                $checked++
                if (-not $actual.ContainsKey($key)) {
                    if ($key -ne 'Customers.ImageUrl') { $mismatches.Add("Missing column: $key") }
                    continue
                }
                if ($actual[$key].Type -ne $column.Groups[2].Value -or $actual[$key].Nullable -ne ($column.Groups[3].Value -eq 'true')) { $mismatches.Add("Type/nullability differs: $key") }
            }
        }
    }
    if (-not $actual.ContainsKey('Services.ImageUrl') -or $actual['Services.ImageUrl'].Type -ne 'nvarchar(500)') { $mismatches.Add('Services.ImageUrl does not match the additive migration.') }
    if ($mismatches.Count -gt 0) { throw ($mismatches -join "`n") }
    Write-Output "Validated $checked baseline/chat columns and Services.ImageUrl. Legacy tables and rows will be retained."
    if (-not $Apply) { Write-Output 'Read-only inspection complete. Use -Apply to reconcile development migration history.'; return }
    $transaction = $connection.BeginTransaction([System.Data.IsolationLevel]::Serializable)
    try {
        $command.Transaction = $transaction
        $command.CommandText = "IF COL_LENGTH('Customers','ImageUrl') IS NULL ALTER TABLE Customers ADD ImageUrl nvarchar(500) NULL;"
        [void]$command.ExecuteNonQuery()
        foreach ($migrationId in $migrationIds) {
            $command.Parameters.Clear()
            [void]$command.Parameters.AddWithValue('@migrationId', $migrationId)
            $command.CommandText = 'IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId=@migrationId) INSERT INTO __EFMigrationsHistory (MigrationId,ProductVersion) VALUES (@migrationId,''10.0.13'');'
            [void]$command.ExecuteNonQuery()
        }
        $transaction.Commit()
        Write-Output 'Development baseline reconciled. Existing migration history was retained.'
    } catch { $transaction.Rollback(); throw }
} finally { $connection.Dispose() }
