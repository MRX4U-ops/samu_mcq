try {
    Write-Host "Loading WinRT assemblies..."
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    
    # Generic reflection-based await helper
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
    
    Write-Host "Fetching clipboard history items..."
    $op = [Windows.ApplicationModel.DataTransfer.Clipboard]::GetHistoryItemsAsync()
    $result = Await-AsyncOperation -AsyncOp $op -ResultType ([Windows.ApplicationModel.DataTransfer.ClipboardHistoryItemsResult])
    
    Write-Host "Status: $($result.Status)"
    Write-Host "Items Count: $($result.Items.Count)"
    
    $idx = 0
    foreach ($item in $result.Items) {
        try {
            $textOp = $item.Content.GetTextAsync()
            $text = Await-AsyncOperation -AsyncOp $textOp -ResultType ([String])
            
            Write-Host "=== ITEM $($idx) ==="
            Write-Host $text
        } catch {
            Write-Host "Failed to get text for item $($idx) : $_"
        }
        $idx++
    }
} catch {
    Write-Error "Unexpected error: $_"
}
