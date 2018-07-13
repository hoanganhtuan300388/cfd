Var path

# for installer title change macro
!include WinMessages.nsh

# change title macro
!define SetTitleBar "!insertmacro SetTitleBar"
!macro SetTitlebar Str
  SendMessage $HWNDPARENT ${WM_SETTEXT} 0 "STR:${Str}"
!macroend

# installer title
Caption "${SHORTCUT_NAME}"

!macro preInit

  strCpy $path "$PROGRAMFILES64\CLICK-SEC\${APP_FILENAME}"

	SetRegView 64
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation $path
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation $path
	SetRegView 32
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation $path
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation $path
!macroend