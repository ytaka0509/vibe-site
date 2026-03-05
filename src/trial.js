import './trial.css'

const STORAGE_KEY = 'taskflow_trial_tasks'

const COLUMNS = ['todo', 'inprogress', 'done']
const COLUMN_LABELS = { todo: '未着手', inprogress: '進行中', done: '完了' }
const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }
const TAG_LABELS = { design: 'デザイン', dev: '開発', marketing: 'マーケ', other: 'その他' }

let tasks = loadTasks()

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultTasks()
  } catch {
    return getDefaultTasks()
  }
}

function getDefaultTasks() {
  const now = Date.now()
  return [
    // 未着手
    { id: uid(), text: 'ランディングページのヒーローコピー改善', priority: 'high', tag: 'marketing', col: 'todo', createdAt: now },
    { id: uid(), text: 'メールキャンペーン文面の作成', priority: 'medium', tag: 'marketing', col: 'todo', createdAt: now - 100 },
    { id: uid(), text: '競合他社リサーチレポートの作成', priority: 'medium', tag: 'other', col: 'todo', createdAt: now - 200 },
    { id: uid(), text: 'ユーザーテスト計画書の策定', priority: 'high', tag: 'design', col: 'todo', createdAt: now - 300 },
    { id: uid(), text: 'モバイル対応のレイアウト調整', priority: 'low', tag: 'design', col: 'todo', createdAt: now - 400 },
    // 進行中
    { id: uid(), text: 'APIエンドポイントの実装', priority: 'high', tag: 'dev', col: 'inprogress', createdAt: now - 500 },
    { id: uid(), text: 'ダッシュボードUIのコーディング', priority: 'medium', tag: 'dev', col: 'inprogress', createdAt: now - 600 },
    { id: uid(), text: '週次チームMTGアジェンダの作成', priority: 'low', tag: 'other', col: 'inprogress', createdAt: now - 700 },
    { id: uid(), text: 'SNS広告クリエイティブのデザイン', priority: 'medium', tag: 'design', col: 'inprogress', createdAt: now - 800 },
    // 完了
    { id: uid(), text: 'ユーザーインタビューの実施（5名）', priority: 'high', tag: 'marketing', col: 'done', createdAt: now - 900 },
    { id: uid(), text: 'デザインモックアップのレビュー', priority: 'medium', tag: 'design', col: 'done', createdAt: now - 1000 },
    { id: uid(), text: '要件定義書の作成', priority: 'high', tag: 'other', col: 'done', createdAt: now - 1100 },
    { id: uid(), text: 'データベーススキーマ設計', priority: 'medium', tag: 'dev', col: 'done', createdAt: now - 1200 },
  ]
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function renderAll() {
  COLUMNS.forEach(col => {
    const list = document.getElementById(`list-${col}`)
    const colTasks = tasks.filter(t => t.col === col)
    list.innerHTML = ''
    colTasks.forEach(task => list.appendChild(createTaskEl(task)))
    document.getElementById(`count-${col}`).textContent = colTasks.length
  })
}

function createTaskEl(task) {
  const el = document.createElement('div')
  el.className = 'task-card'
  el.setAttribute('draggable', 'true')
  el.dataset.id = task.id

  const nextCol = COLUMNS[COLUMNS.indexOf(task.col) + 1]
  const prevCol = COLUMNS[COLUMNS.indexOf(task.col) - 1]

  el.innerHTML = `
    <div class="task-card-top">
      <span class="task-priority priority--${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
      <span class="task-tag tag--${task.tag}">${TAG_LABELS[task.tag]}</span>
      <button class="task-delete" data-id="${task.id}" title="削除">×</button>
    </div>
    <p class="task-text">${escapeHtml(task.text)}</p>
    <div class="task-actions">
      ${prevCol ? `<button class="btn btn-xs btn-ghost task-move-prev" data-id="${task.id}" data-col="${prevCol}">← ${COLUMN_LABELS[prevCol]}</button>` : '<span></span>'}
      ${nextCol ? `<button class="btn btn-xs btn-primary task-move-next" data-id="${task.id}" data-col="${nextCol}">${COLUMN_LABELS[nextCol]} →</button>` : '<span class="done-mark">完了!</span>'}
    </div>
  `

  // ドラッグ
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('taskId', task.id)
    el.classList.add('dragging')
  })
  el.addEventListener('dragend', () => el.classList.remove('dragging'))

  return el
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// イベント委任
document.getElementById('kanbanBoard').addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.task-delete')
  if (deleteBtn) {
    const id = deleteBtn.dataset.id
    tasks = tasks.filter(t => t.id !== id)
    saveTasks()
    renderAll()
    return
  }

  const moveBtn = e.target.closest('.task-move-next, .task-move-prev')
  if (moveBtn) {
    const id = moveBtn.dataset.id
    const col = moveBtn.dataset.col
    const task = tasks.find(t => t.id === id)
    if (task) {
      task.col = col
      saveTasks()
      renderAll()
    }
  }
})

// ドラッグ&ドロップ
document.querySelectorAll('.task-list').forEach(list => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault()
    list.classList.add('drag-over')
  })
  list.addEventListener('dragleave', () => list.classList.remove('drag-over'))
  list.addEventListener('drop', (e) => {
    e.preventDefault()
    list.classList.remove('drag-over')
    const id = e.dataTransfer.getData('taskId')
    const col = list.dataset.col
    const task = tasks.find(t => t.id === id)
    if (task && task.col !== col) {
      task.col = col
      saveTasks()
      renderAll()
    }
  })
})

// タスク追加
document.getElementById('addTaskBtn').addEventListener('click', addTask)
document.getElementById('newTaskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask()
})

function addTask() {
  const input = document.getElementById('newTaskInput')
  const text = input.value.trim()
  if (!text) {
    input.focus()
    input.classList.add('input-error')
    setTimeout(() => input.classList.remove('input-error'), 600)
    return
  }
  const priority = document.getElementById('newTaskPriority').value
  const tag = document.getElementById('newTaskTag').value
  tasks.unshift({ id: uid(), text, priority, tag, col: 'todo', createdAt: Date.now() })
  saveTasks()
  renderAll()
  input.value = ''
  input.focus()
}

// 全クリア
document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm('全てのタスクを削除しますか？')) {
    tasks = []
    saveTasks()
    renderAll()
  }
})

// 初期レンダリング
renderAll()
