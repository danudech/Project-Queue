
$connStr = 'Server=10.10.10.103,1402;Database=QueueDB;User Id=sa;Password=txtValidate104;Encrypt=False;TrustServerCertificate=True;Connect Timeout=15;'
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
try {
    $conn.Open()
    $updates = @(
        @{ Table = 'Shops'; Id = 1; Name = 'คลินิกสุขภาพดี Demo' },
        @{ Table = 'ShopBranches'; Id = 1; Name = 'สาขาสุขุมวิท (สาขาหลัก)' },
        @{ Table = 'ShopBranches'; Id = 2; Name = 'สาขาอโศก' },
        @{ Table = 'ShopBranches'; Id = 3; Name = 'สาขาหลัก (Main Branch)' },
        @{ Table = 'Users'; Id = 1; Name = 'นายสมศักดิ์ สุขสวัสดิ์' },
        @{ Table = 'Users'; Id = 2; Name = 'นางสาวสมร ใจดี' },
        @{ Table = 'Users'; Id = 3; Name = 'นายสมชาย มั่นคง' },
        @{ Table = 'Users'; Id = 5; Name = 'นายกิตติ ชูชัย' },
        @{ Table = 'Users'; Id = 6; Name = 'นางสาวอนงค์ สดใส' }
    )
    foreach ($item in $updates) {
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = 'UPDATE ' + $item.Table + ' SET Name = @name WHERE Id = @rowId'
        $paramName = $cmd.Parameters.Add('@name', [System.Data.SqlDbType]::NVarChar, 150)
        $paramName.Value = $item.Name
        $paramRowId = $cmd.Parameters.Add('@rowId', [System.Data.SqlDbType]::Int)
        $paramRowId.Value = $item.Id
        $cmd.ExecuteNonQuery() | Out-Null
    }
    Write-Output 'SUCCESS_UNICODE_UPDATE'
} finally {
    $conn.Close()
}
