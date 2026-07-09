!include "nsProcess.nsh"

!macro customInit
  DetailPrint "Checking for running Sunjin ERP process before update..."
  ${nsProcess::FindProcess} "Sunjin ERP.exe" $0
  ${If} $0 == 0
    DetailPrint "Closing running Sunjin ERP process..."
    ${nsProcess::CloseProcess} "Sunjin ERP.exe" $0
    Sleep 3000
  ${EndIf}

  ${nsProcess::FindProcess} "Sunjin ERP.exe" $0
  ${If} $0 == 0
    DetailPrint "Forcing Sunjin ERP process to stop before replacing files..."
    ${nsProcess::KillProcess} "Sunjin ERP.exe" $0
    Sleep 3000
  ${EndIf}

  ${nsProcess::Unload}
!macroend
