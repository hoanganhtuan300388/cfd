import {MenuItemConstructorOptions} from 'electron';

export const AppMenu:MenuItemConstructorOptions[] = [
  {
    submenu: [
      {role: 'quit', label: '終了'}
    ]
  },
  {
    label: '編集',
    submenu: [
      { role: 'undo', label: '元に戻す' },
      { role: 'redo', label: 'やり直し' },
      { type: 'separator' },
      { role: 'cut', label: '切り取り' },
      { role: 'copy', label: 'コピー' },
      { role: 'paste', label: '貼り付け' },
      { role: 'delete', label: '削除' },
      { role: 'selectall', label: 'すべてを選択' }
    ]
  }
]