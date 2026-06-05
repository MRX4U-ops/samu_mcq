Add-Type -AssemblyName System.Drawing
$inputFile = "C:\Users\mohd6\.gemini\antigravity\brain\5d743708-a72d-4bfd-9ea0-a28c326705ca\media__1777569550884.jpg"
$outputFile = "c:\samu_mcq\mobile-app\assets\icon.png"
$splashFile = "c:\samu_mcq\mobile-app\assets\splash.png"

$img = [System.Drawing.Image]::FromFile($inputFile)
$img.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Save($splashFile, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
