!macro preInit
    ; Definir ruta personalizada en AppData
    SetShellVarContext current
    StrCpy $INSTDIR "$APPDATA\StormGamesStudios\Programs\StormPanel APP"
!macroend