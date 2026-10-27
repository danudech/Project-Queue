$connectionString = "Server=10.10.10.103,1402;Database=QueueDB;User Id=sa;Password=txtValidate104;Encrypt=False;TrustServerCertificate=True;Connect Timeout=60;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()
$command = $connection.CreateCommand()
$command.CommandText = "SELECT Id, Name, ImageUrl, Price FROM Services"
$reader = $command.ExecuteReader()
while ($reader.Read()) {
    Write-Host "$($reader['Id']) | $($reader['Name']) | $($reader['ImageUrl']) | $($reader['Price'])"
}
$connection.Close()
