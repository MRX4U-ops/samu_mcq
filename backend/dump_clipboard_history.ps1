try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    
    function Await-AsyncOperation {
        param(
            [Parameter(Mandatory = $true)]
            $AsyncOp,
            [Parameter(Mandatory = $true)]
            [Type]$ResultType
        )

        $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | 
            Where-Object { 
                $_.Name -eq 'AsTask' -and 
                $_.GetParameters().Count -eq 1 -and 
                $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
            })[0]

        $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
        $netTask = $asTask.Invoke($null, @($AsyncOp))
        
        $netTask.Wait(-1) | Out-Null
        return $netTask.Result
    }

    $null = [Windows.ApplicationModel.DataTransfer.Clipboard, Windows.ApplicationModel.DataTransfer, ContentType=WindowsRuntime]
    
    $op = [Windows.ApplicationModel.DataTransfer.Clipboard]::GetHistoryItemsAsync()
    $result = Await-AsyncOperation -AsyncOp $op -ResultType ([Windows.ApplicationModel.DataTransfer.ClipboardHistoryItemsResult])
    
    $outFile = "c:\samu_mcq\backend\full_clipboard_history.txt"
    $sb = New-Object System.Text.StringBuilder
    
    [void]$sb.AppendLine("Clipboard Items Count: $($result.Items.Count)")
    
    $idx = 0
    foreach ($item in $result.Items) {
        try {
            $textOp = $item.Content.GetTextAsync()
            $text = Await-AsyncOperation -AsyncOp $textOp -ResultType ([String])
            
            [void]$sb.AppendLine("=== ITEM $($idx) ===")
            [void]$sb.AppendLine($text)
            [void]$sb.AppendLine()
        } catch {
            [void]$sb.AppendLine("=== ITEM $($idx) [FAILED TO GET TEXT] ===")
            [void]$sb.AppendLine($_)
            [void]$sb.AppendLine()
        }
        $idx++
    }
    
    [System.IO.File]::WriteAllText($outFile, $sb.ToString())
    Write-Host "Successfully dumped $($idx) clipboard items to $outFile"
} catch {
    Write-Error "Unexpected error: $_"
}
