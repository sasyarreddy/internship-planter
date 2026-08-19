import { useEffect, useRef, useState } from 'react'
import './App.css'

import logo from './assets/logo.png'

import stage1 from './assets/stage1.png'
import stage2 from './assets/stage2.png'
import stage3 from './assets/stage3.png'
import stage4 from './assets/stage4.png'
import stage5 from './assets/stage5.png'
import stage6 from './assets/stage6.png'
import stage7 from './assets/stage7.png'
import stage8 from './assets/stage8.png'
import stage9 from './assets/stage9.png'
import stage10 from './assets/stage10.png'
import stage11 from './assets/stage11.png'
import stage12 from './assets/stage12.png'

import appleBasket from './assets/apple_basket.png'
import apple from './assets/apple.png'


import wateringCan from './assets/watering-can.png'
import plantFood from './assets/plant-food.png'
import journalIcon from './assets/journal-icon.png'


/* =========================================
   CONSTANTS
========================================= */

const TOTAL_WEEKS = 12
const MAX_ATTACHMENT_SIZE = 600000
const MAX_ATTACHMENTS = 3

/* =========================================
   BACKEND AUTH + LOCAL USER DATA
========================================= */

const AUTH_SESSION_KEY = 'planterCurrentUser'
const LEGACY_MIGRATION_KEY = 'planterLegacyDataMigrated'

const USER_DATA_KEYS = [
  'currentWeek',
  'plantHealth',
  'waterCount',
  'plantFoodCount',
  'journalEntries',
  'fruitStories',
  'internProfile',
  'demoDate',
  'completedTasks',
  'rewardedTasks',
  'todos',
  'lastTodoDate',
  'lastHealthDate',
]

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

function getActiveUsername() {
  return (
    window.localStorage.getItem(AUTH_SESSION_KEY) || ''
  )
}

function getUserStorageKey(key) {
  const username = getActiveUsername()

  return username
    ? `planter:${username}:${key}`
    : `planter:guest:${key}`
}

function getUserItem(key) {
  return window.localStorage.getItem(
    getUserStorageKey(key)
  )
}

function setUserItem(key, value) {
  window.localStorage.setItem(
    getUserStorageKey(key),
    String(value)
  )
}

function migrateLegacyDataOnce(username) {
  if (
    window.localStorage.getItem(LEGACY_MIGRATION_KEY)
  ) {
    return
  }

  USER_DATA_KEYS.forEach((key) => {
    const oldValue =
      window.localStorage.getItem(key)

    const newKey =
      `planter:${username}:${key}`

    if (
      oldValue !== null &&
      window.localStorage.getItem(newKey) === null
    ) {
      window.localStorage.setItem(
        newKey,
        oldValue
      )
    }
  })

  window.localStorage.setItem(
    LEGACY_MIGRATION_KEY,
    username
  )
}

const TASKS = [
  'Complete an intern swap day',
  'Have coffee with your supervisor',
  'Connect with 5 MGE people on LinkedIn',
  'Attend a collaboration day',
  'Complete your capstone project',
  'Complete your orientation',
  'Attend a business talk',
  'Have your first meeting with your project coordinator',
  'Volunteer with the intern group',
  'Have donuts with the CEO',
  'Attend a second collaboration day',
  'Present your capstone project',
  'Tour Blount',
  'Explore the gym or yoga studio',
  'Have lunch with your team',
  'Celebrate National Intern Day',
  'Complete the Energizing Race',
  'Go to a Lunch Connect with a fellow intern',
  'Try out the coffee machine',
  'Eat lunch in the HUB',
  'Have your second meeting with your project coordinator',
  'Attend a college intern event',
  'Try the sparkling water machine',
  'Attend the high school celebration',
]

const plantStages = [
  stage1,
  stage2,
  stage3,
  stage4,
  stage5,
  stage6,
  stage7,
  stage8,
  stage9,
  stage10,
  stage11,
  stage12,
]

const JOURNAL_PROMPTS = [
  {
    id: 1,
    title: 'New beginnings 𖧧𖡼𖤣',
    prompt:
      'What are your first impressions of your internship, and what do you hope to accomplish? Think about what has surprised you, what you are excited about, and 2–3 goals you want to work toward.',
  },
  {
    id: 2,
    title: 'First leaves 𖧧𖡼𖤣',
    prompt:
      'How are you enjoying the company culture so far? What aspects of the workplace, team, or environment do you enjoy? Is there anything you find challenging or would change?',
  },
  {
    id: 3,
    title: 'Growing stronger 𖧧𖡼𖤣',
    prompt:
      'How does the work you are doing differ from your academic experience? Think about what school prepared you for, what feels completely new, and what you are learning from working in a professional environment.',
  },
  {
    id: 4,
    title: 'Branching out 𖧧𖡼𖤣',
    prompt:
      'What technical or professional skills have you picked up during your internship? Describe a tool, technology, process, or skill you have become more comfortable with and how you learned it.',
  },
  {
    id: 5,
    title: 'In bloom 𖧧𖡼𖤣',
    prompt:
      'How have you grown and contributed since the beginning of your internship? What work are you most proud of? How have your responsibilities, confidence, or goals changed? What do you still want to accomplish before the internship ends?',
  },
  {
    id: 6,
    title: 'Ready to thrive 𖧧𖡼𖤣',
    prompt:
      'What are your favorite memories from your internship, and what will you take away from the experience? Think about memorable people, projects, events, lessons, and how this experience may influence what you want to do next.',
  },
]


/* =========================================
   DATE HELPERS
========================================= */

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDaysBetween(startKey, endKey) {
  const [startYear, startMonth, startDay] =
    startKey.split('-').map(Number)

  const [endYear, endMonth, endDay] =
    endKey.split('-').map(Number)

  const start = Date.UTC(
    startYear,
    startMonth - 1,
    startDay
  )

  const end = Date.UTC(
    endYear,
    endMonth - 1,
    endDay
  )

  return Math.floor(
    (end - start) /
      (1000 * 60 * 60 * 24)
  )
}


/* =========================================
   JOURNAL HELPERS
========================================= */

function getJournalWordCount(html) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return 0
  }

  return text.split(' ').length
}

function normalizeJournalLink(url) {
  const trimmed = url.trim()

  if (!trimmed) {
    return ''
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed
  }

  return `https://${trimmed}`
}

function sanitizeJournalHtml(html) {
  const parser = new DOMParser()

  const documentCopy = parser.parseFromString(
    `<div>${html}</div>`,
    'text/html'
  )

  const allowedTags = new Set([
    'DIV',
    'P',
    'BR',
    'B',
    'STRONG',
    'I',
    'EM',
    'U',
    'A',
    'UL',
    'OL',
    'LI',
  ])

  const elements = Array.from(
    documentCopy.body.querySelectorAll('*')
  )

  elements.forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    Array.from(element.attributes).forEach(
      (attribute) => {
        const keepHref =
          element.tagName === 'A' &&
          attribute.name.toLowerCase() === 'href'

        if (!keepHref) {
          element.removeAttribute(attribute.name)
        }
      }
    )

    if (element.tagName === 'A') {
      const href =
        element.getAttribute('href') || ''

      if (!/^https?:\/\//i.test(href)) {
        element.removeAttribute('href')
      } else {
        element.setAttribute(
          'target',
          '_blank'
        )

        element.setAttribute(
          'rel',
          'noopener noreferrer'
        )
      }
    }
  })

  return (
    documentCopy.body.firstElementChild
      ?.innerHTML || ''
  )
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve({
        id:
          `${Date.now()}-${Math.random()}`,
        name:
          file.name,
        type:
          file.type,
        size:
          file.size,
        dataUrl:
          reader.result,
        imageWidth:
          file.type.startsWith('image/')
            ? 260
            : null,
      })
    }

    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}


/* =========================================
   WEEK PROGRESS
========================================= */

function WeekProgress({
  currentWeek,
  previousWeek,
  nextWeek,
}) {
  return (
    <>
      <div className="week-title-row">
        <button
          type="button"
          className="week-arrow"
          onClick={previousWeek}
          disabled={currentWeek === 1}
        >
          ←
        </button>

        <h2>
          WEEK {currentWeek} OF {TOTAL_WEEKS}
        </h2>

        <button
          type="button"
          className="week-arrow"
          onClick={nextWeek}
          disabled={
            currentWeek === TOTAL_WEEKS
          }
        >
          →
        </button>
      </div>

      <div className="week-progress">
        {Array.from(
          { length: TOTAL_WEEKS },
          (_, index) => {
            const week = index + 1

            let status = 'future'

            if (week < currentWeek) {
              status = 'complete'
            }

            if (week === currentWeek) {
              status = 'current'
            }

            return (
              <div
                className="week-section"
                key={week}
              >
                <div
                  className={
                    `week-circle ${status}`
                  }
                >
                  {week}
                </div>

                {week < TOTAL_WEEKS && (
                  <div
                    className={
                      `week-line ${
                        week < currentWeek
                          ? 'complete'
                          : ''
                      }`
                    }
                  />
                )}
              </div>
            )
          }
        )}
      </div>
    </>
  )
}


/* =========================================
   PROGRESS CARD
========================================= */

function ProgressCard({
  currentWeek,
  previousWeek,
  nextWeek,
  health,
  waterCount,
  plantFoodCount,
  usePlantFood,
}) {
  return (
    <section className="progress-card">
      <WeekProgress
        currentWeek={currentWeek}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
      />

      <div className="card-divider" />

      <div className="health-title">
        <span>
          Plant Health
        </span>

        <span>
          {health}%
        </span>
      </div>

      <div className="health-bar">
        <div
          className="health-fill"
          style={{
            width: `${health}%`,
          }}
        />
      </div>

      <div className="reward-images">
        <div className="reward-item">
          <img
            src={wateringCan}
            alt="Watering can"
            className="watering-image"
          />

          <span className="reward-count">
            Water: {waterCount}
          </span>
        </div>

        <div className="reward-item">
          <img
            src={plantFood}
            alt="Plant food"
            className="food-image"
          />

          <span className="reward-count">
            Plant Food: {plantFoodCount}
          </span>
        </div>
      </div>
    </section>
  )
}


/* =========================================
   TASKS CARD
========================================= */

function TasksCard({
  completedTasks,
  toggleTask,
  resetTasks,
}) {
  return (
    <section className="tasks-card">
      <div className="tasks-header">
        <h2>
          Tasks
        </h2>

        <button
          type="button"
          className="tasks-reset"
          onClick={resetTasks}
        >
          Reset
        </button>
      </div>

      <div className="task-list">
        {TASKS.map(
          (task, index) => {
            const completed =
              completedTasks.includes(index)

            return (
              <label
                className={
                  `task-row ${
                    completed
                      ? 'completed'
                      : ''
                  }`
                }
                key={task}
              >
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() =>
                    toggleTask(index)
                  }
                />

                <span className="task-name">
                  {task}
                </span>
              </label>
            )
          }
        )}
      </div>
    </section>
  )
}


/* =========================================
   TO-DO NOTE
========================================= */

function TodoNote({
  todos,
  newTodo,
  setNewTodo,
  addTodo,
  toggleTodo,
}) {
  return (
    <section className="todo-note">
      <div className="push-pin" />

      <div className="todo-header">
        <h2>
          To-do
        </h2>
      </div>

      <div className="todo-add-row">
        <input
          type="text"
          value={newTodo}
          placeholder="Add reminder..."
          onChange={(event) =>
            setNewTodo(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === 'Enter'
            ) {
              addTodo()
            }
          }}
        />

        <button
          type="button"
          onClick={addTodo}
        >
          + add
        </button>
      </div>

      <div className="todo-list">
        {todos.map((todo) => (
          <label
            className={
              `todo-item ${
                todo.completed
                  ? 'todo-completed'
                  : ''
              }`
            }
            key={todo.id}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() =>
                toggleTodo(todo.id)
              }
            />

            <span>
              {todo.text}
            </span>
          </label>
        ))}
      </div>

      <div className="paper-corner" />
    </section>
  )
}


/* =========================================
   DEMO CALENDAR
========================================= */

function CalendarControl({
  demoDate,
  nextDay,
  resetCalendar,
}) {
  const displayDate =
    demoDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )

  return (
    <section className="calendar-control">
      <div className="calendar-title">
        Demo Date
      </div>

      <div className="calendar-row">
        <span className="calendar-date">
          {displayDate}
        </span>

        <button
          type="button"
          className="calendar-arrow"
          onClick={nextDay}
        >
          →
        </button>
      </div>

      <button
        type="button"
        className="calendar-reset"
        onClick={resetCalendar}
      >
        Reset Date
      </button>
    </section>
  )
}

//journal preview 
function JournalCard({
  openJournal,
  currentWeek
}) {

  const stageId =
    Math.ceil(currentWeek / 2)


  const currentPrompt =
    JOURNAL_PROMPTS.find(
      stage =>
        stage.id === stageId
    )


  return (
    <section className="journal-card">

     


      <h3>
        {currentPrompt.title}
      </h3>


      <p>
        {currentPrompt.prompt}
      </p>


      <button
        type="button"
        className="journal-button"
        onClick={openJournal}
      >

        <span>
          Write Journal Entry
        </span>

        <span>
          →
        </span>

      </button>

    </section>
  )
}


/* =========================================
   JOURNAL PAGE
========================================= */

function JournalPage({
  currentWeek,
  journalEntries,
  saveJournalEntry,
  deleteJournalEntry,
}) {
  const editorRef = useRef(null)

  const defaultStage =
    Math.min(
      JOURNAL_PROMPTS.length,
      Math.max(
        1,
        Math.ceil(currentWeek / 2)
      )
    )

  const [
    selectedStageId,
    setSelectedStageId,
  ] =
    useState(defaultStage)

  const [
    selectedEntryId,
    setSelectedEntryId,
  ] =
    useState(null)

  const [
    entryType,
    setEntryType,
  ] =
    useState('prompt')

  const [
    journalTitle,
    setJournalTitle,
  ] =
    useState('')

  const [
    editorHtml,
    setEditorHtml,
  ] =
    useState('')

  const [
    attachments,
    setAttachments,
  ] =
    useState([])

  const [
    saveMessage,
    setSaveMessage,
  ] =
    useState('')

  const selectedStage =
    JOURNAL_PROMPTS.find(
      (stage) =>
        stage.id === selectedStageId
    ) || JOURNAL_PROMPTS[0]

  const existingEntry =
    selectedEntryId
      ? journalEntries.find(
          (entry) =>
            entry.id === selectedEntryId
        )
      : null

  const wordCount =
    getJournalWordCount(
      editorHtml
    )

  const sortedEntries =
    [...journalEntries].sort(
      (a, b) =>
        Number(
          b.createdAt ||
          b.updatedAt ||
          0
        ) -
        Number(
          a.createdAt ||
          a.updatedAt ||
          0
        )
    )

  function setEditorContent(html) {
    const nextHtml = html || ''

    setEditorHtml(nextHtml)

    if (editorRef.current) {
      editorRef.current.innerHTML =
        nextHtml
    }
  }


  function startNewEntry() {
    setEntryType('custom')
    setSelectedEntryId(null)
    setJournalTitle('')
    setAttachments([])
    setEditorContent('')
    setSaveMessage('')
  }

  function openPastEntry(entry) {
    setSelectedEntryId(entry.id)
    setEntryType(
      entry.entryType ||
      (entry.stageId
        ? 'prompt'
        : 'custom')
    )

    if (entry.stageId) {
      setSelectedStageId(
        entry.stageId
      )
    }

    setJournalTitle(
      entry.title || ''
    )
    setAttachments(
      entry.attachments || []
    )
    setEditorContent(
      entry.content || ''
    )
    setSaveMessage('')
  }

 
  function formatText(command) {
    if (!editorRef.current) {
      return
    }

    editorRef.current.focus()

    document.execCommand(
      command,
      false,
      null
    )

    setEditorHtml(
      editorRef.current.innerHTML
    )
  }

  function addLink() {
    const url =
      window.prompt(
        'Paste or type the link:'
      )

    if (!url) {
      return
    }

    const normalizedUrl =
      normalizeJournalLink(url)

    if (!normalizedUrl) {
      return
    }

    if (!editorRef.current) {
      return
    }

    editorRef.current.focus()

    document.execCommand(
      'createLink',
      false,
      normalizedUrl
    )

    setEditorHtml(
      editorRef.current.innerHTML
    )
  }

function handleDeleteEntry(entry, event) {
  event.stopPropagation()

  const shouldDelete =
    window.confirm(
      `Delete "${entry.title || 'Untitled Entry'}"? This cannot be undone.`
    )

  if (!shouldDelete) {
    return
  }

  deleteJournalEntry(entry.id)

  if (selectedEntryId === entry.id) {
    setSelectedEntryId(null)
    setJournalTitle('')
    setAttachments([])
    setEditorContent('')
    setSaveMessage('Entry deleted.')
  }
}


  async function handleJournalFiles(
    event
  ) {
    const chosenFiles =
      Array.from(
        event.target.files || []
      )

    if (!chosenFiles.length) {
      return
    }

    const roomLeft =
      MAX_ATTACHMENTS -
      attachments.length

    if (roomLeft <= 0) {
      window.alert(
        `You can attach up to ${MAX_ATTACHMENTS} files to one entry.`
      )

      event.target.value = ''
      return
    }

    const filesToAdd =
      chosenFiles
        .slice(0, roomLeft)
        .filter((file) => {
          if (
            file.size >
            MAX_ATTACHMENT_SIZE
          ) {
            window.alert(
              `${file.name} is too large for this demo. Keep each attachment under 1 MB.`
            )

            return false
          }

          return true
        })

    if (!filesToAdd.length) {
      event.target.value = ''
      return
    }

    try {
      const newAttachments =
        await Promise.all(
          filesToAdd.map(
            readFileAsDataUrl
          )
        )

      setAttachments(
        (current) => [
          ...current,
          ...newAttachments,
        ]
      )
    } catch {
      window.alert(
        'One of the attachments could not be added.'
      )
    }

    event.target.value = ''
  }

  function removeAttachment(
    attachmentId
  ) {
    setAttachments(
      (current) =>
        current.filter(
          (attachment) =>
            attachment.id !==
            attachmentId
        )
    )
  }

  function resizeAttachment(
    attachmentId,
    width
  ) {
    setAttachments(
      (current) =>
        current.map(
          (attachment) =>
            attachment.id ===
            attachmentId
              ? {
                  ...attachment,
                  imageWidth:
                    Number(width),
                }
              : attachment
        )
    )
  }

  function handleSaveEntry() {
    const cleanedTitle =
      journalTitle.trim()

    const cleanedHtml =
      sanitizeJournalHtml(
        editorHtml
      )

    if (!cleanedTitle) {
      setSaveMessage(
        'Add a title before saving.'
      )

      return
    }

    if (
      getJournalWordCount(
        cleanedHtml
      ) === 0
    ) {
      setSaveMessage(
        'Write something before saving.'
      )

      return
    }

    const result =
      saveJournalEntry({
        entryId:
          selectedEntryId,
        title:
          cleanedTitle,
        stageId:
          entryType === 'prompt'
            ? selectedStageId
            : null,
        entryType,
        content:
          cleanedHtml,
        attachments,
      })

    setSelectedEntryId(
      result.entryId
    )

    setJournalTitle(
      cleanedTitle
    )

    setEditorContent(
      cleanedHtml
    )

    if (result.created) {
      setSaveMessage(
        'Entry saved! +1 Plant Food'
      )
    } else {
      setSaveMessage(
        'Changes saved.'
      )
    }
  }

  return (
    <section className="journal-page">

      {/* LEFT SIDEBAR */}

      <aside className="journal-side-info">
        <div className="journal-side-title">
          Journal ✎ᝰ
        </div>

        <div className="suggestion">
          {entryType === 'custom'
            ? 'free journal entry'
            : 'suggested journaling prompt'}
        </div>

        <div className="journal-prompt-copy">
          {entryType === 'custom' ? (
            <>
              <h3>
                Write about anything 𖧧𖡼𖤣
              </h3>

              <p>
                This entry does not have to follow the suggested internship prompt. Use it for notes, memories, ideas, goals, or anything else you want to remember.
              </p>
            </>
          ) : (
            <>
              <h3>
                {selectedStage.title}
              </h3>

              <p>
                {selectedStage.prompt}
              </p>
            </>
          )}
        </div>


      </aside>


      {/* JOURNAL EDITOR */}

      <div className="journal-editor">
        <div className="journal-editor-heading">
          <div>
            <input
              type="text"
              className="journal-title-input"
              value={journalTitle}
              placeholder="My Journal Entry"
              aria-label="Journal entry title"
              onChange={(event) =>
                setJournalTitle(
                  event.target.value
                )
              }
              style={{
                width: '100%',
                border: 'none',
                borderBottom:
                  '2px solid rgba(20, 63, 43, 0.25)',
                background:
                  'transparent',
                font: 'inherit',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'inherit',
                padding: '0 0 6px',
                outline: 'none',
              }}
            />

            <p>
              Week {currentWeek}
            </p>
          </div>

          <button
            type="button"
            className="save-journal"
            onClick={startNewEntry}
          >
            + Add New Entry
          </button>
        </div>

        <div className="journal-toolbar">
          <button
            type="button"
            title="Bold"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              formatText('bold')
            }
          >
            <strong>
              B
            </strong>
          </button>

          <button
            type="button"
            title="Italic"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              formatText('italic')
            }
          >
            <em>
              I
            </em>
          </button>

          <button
            type="button"
            title="Underline"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              formatText(
                'underline'
              )
            }
          >
            <u>
              U
            </u>
          </button>

          <button
            type="button"
            title="Add link"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={addLink}
          >
            🔗
          </button>

          <label
            className="journal-attachment-button"
          >
            📎 Attach

            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={
                handleJournalFiles
              }
            />
          </label>
        </div>

        <div
          ref={editorRef}
          className="journal-textarea"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={
            entryType === 'custom'
              ? 'Write anything you want to remember...'
              : 'Write about your week...'
          }
          onInput={(event) =>
            setEditorHtml(
              event.currentTarget
                .innerHTML
            )
          }
        />

        {attachments.length > 0 && (
          <div className="journal-attachments">
            {attachments.map(
              (attachment) => {
                const isImage =
                  attachment.type
                    .startsWith(
                      'image/'
                    )

                const imageWidth =
                  attachment.imageWidth ||
                  260

                return (
                  <div
                    className="journal-attachment"
                    key={
                      attachment.id
                    }
                  >
                    {isImage ? (
                      <div>
                        <img
                          src={
                            attachment.dataUrl
                          }
                          alt={
                            attachment.name
                          }
                          style={{
                            width:
                              `${imageWidth}px`,
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '8px',
                            fontSize: '0.8rem',
                          }}
                        >
                          Resize

                          <input
                            type="range"
                            min="120"
                            max="520"
                            step="20"
                            value={imageWidth}
                            onChange={(event) =>
                              resizeAttachment(
                                attachment.id,
                                event.target.value
                              )
                            }
                          />

                          <span>
                            {imageWidth}px
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="journal-file-icon">
                        📄
                      </div>
                    )}

                    <div className="journal-attachment-info">
                      <a
                        href={
                          attachment.dataUrl
                        }
                        download={
                          attachment.name
                        }
                      >
                        {
                          attachment.name
                        }
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          removeAttachment(
                            attachment.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}

        <div className="journal-editor-bottom">
          <div className="journal-save-status">
            <span>
              {wordCount} {wordCount === 1
                ? 'word'
                : 'words'}
            </span>

            {saveMessage && (
              <span className="journal-save-message">
                {saveMessage}
              </span>
            )}
          </div>

          <button
            type="button"
            className="save-journal"
            onClick={
              handleSaveEntry
            }
          >
            {existingEntry
              ? 'Save Changes'
              : 'Save Entry'}
          </button>
        </div>
      </div>


      {/* PAST ENTRIES */}

      <aside className="past-entries">
        <h2>
          Past Entries
        </h2>

        {sortedEntries.length === 0 ? (
          <p>
            Your saved journal entries will appear here.
          </p>
        ) : (
          <div className="past-entry-list">
            {sortedEntries.map(
              (entry) => (
                <div
                  className={
                    `past-entry-card ${
                      selectedEntryId ===
                      entry.id
                        ? 'active'
                        : ''
                    }`
                  }
                  key={entry.id}
                >
                  <button
                    type="button"
                    className="past-entry-button"
                    onClick={() =>
                      openPastEntry(entry)
                    }
                  >
                    <strong>
                      {entry.title || 'Untitled Entry'}
                    </strong>

                    <span>
                      Week {entry.weekCreated}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="delete-entry-button"
                    onClick={(event) =>
                      handleDeleteEntry(
                        entry,
                        event
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </aside>
    </section>
  )
}


/* =========================================
   INTERN HUB
========================================= */

const FLOWER_OPTIONS = ['🌷', '🌻', '🌸', '🌼', '🪻', '🌺']

const DEFAULT_INTERN_PROFILE = {
  name: '',
  bio: '',
  hobbies: [],
  linkedin: '',
  flower: '🌷',
  favoriteMovies: [],
  favoriteBooks: [],
  favoriteAlbums: [],
}

function normalizeInternProfile(rawProfile, username = '') {
  const profile = rawProfile || {}

  const oldFavoriteBook = profile.favoriteBook
  const oldFavoriteAlbum = profile.favoriteAlbum

  return {
    ...DEFAULT_INTERN_PROFILE,
    ...profile,
    name:
      typeof profile.name === 'string' && profile.name.trim()
        ? profile.name
        : username,
    hobbies: Array.isArray(profile.hobbies)
      ? profile.hobbies
      : [],
    favoriteMovies: Array.isArray(profile.favoriteMovies)
      ? profile.favoriteMovies
      : [],
    favoriteBooks: Array.isArray(profile.favoriteBooks)
      ? profile.favoriteBooks
      : Array.isArray(oldFavoriteBook)
        ? oldFavoriteBook
        : oldFavoriteBook
          ? [oldFavoriteBook]
          : [],
    favoriteAlbums: Array.isArray(profile.favoriteAlbums)
      ? profile.favoriteAlbums
      : Array.isArray(oldFavoriteAlbum)
        ? oldFavoriteAlbum
        : oldFavoriteAlbum
          ? [oldFavoriteAlbum]
          : [],
  }
}

function readInternProfileForUser(username) {
  const key = `planter:${username}:internProfile`
  const saved = window.localStorage.getItem(key)

  if (!saved) {
    return normalizeInternProfile(null, username)
  }

  try {
    return normalizeInternProfile(
      JSON.parse(saved),
      username
    )
  } catch {
    return normalizeInternProfile(null, username)
  }
}

function parseBackendJson(value, fallback) {
  if (value === null || value === undefined) {
    return fallback
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }

  return value
}

function buildInternProfiles(
  profileRows,
  currentUsername,
  currentProfile
) {
  const normalizedRows = Array.isArray(profileRows)
    ? profileRows
    : []

  const byUsername = new Map(
    normalizedRows
      .filter((row) => row?.username)
      .map((row) => [
        row.username,
        parseBackendJson(row.profile, null),
      ])
  )

  const orderedUsernames = [
    currentUsername,
    ...normalizedRows
      .map((row) => row?.username)
      .filter(
        (username) =>
          username &&
          username !== currentUsername
      ),
  ].filter(Boolean)

  return orderedUsernames.map((username) => ({
    username,
    profile:
      username === currentUsername
        ? normalizeInternProfile(
            currentProfile,
            currentUsername
          )
        : normalizeInternProfile(
            byUsername.get(username),
            username
          ),
  }))
}

const STAR_SKILLS = [
  'Teamwork',
  'Decision Making',
  'Persuasion',
  'Communication Skills',
  'Time Management',
  'Multitasking',
  'Leadership',
  'Problem Solving',
  'Adaptability',
  'Goal Setting/Achievement',
  'Creativity',
  'Conflict Management',
]

// Replace the blank URLs below with the internal links your interns use.
const INTERN_LINKS = [
 
  {
    title: 'Activites Calendar',
    description: 'Intern events, talks, and collaboration days',
    url: 'https://mge0.sharepoint.com/sites/uConnect/_layouts/15/Events.aspx?ListGuid=83d33a74-75e9-457b-8628-cab0d47d372f&AudienceTarget=false&TeamsCID=ec793030-5da8-4d77-94ee-b1f2fbd635a5',
  },
  {
    title: 'IT Help Desk',
    description: 'Get help with your device, accounts, or software',
    url: 'https://mge0.sharepoint.com/sites/DesktopSupportTeam/ServiceDesk/SitePages/Home.aspx?TeamsCID=79a0736a-b1aa-4ff5-abe6-af6069f96465',
  },
  {
    title: 'Parking + Maps',
    description: 'Office maps, parking, and building information',
    url: 'https://mge0.sharepoint.com/sites/O-FacilitiesManagement/SitePages/Maps-%26-Locations.aspx?TeamsCID=ac170d6e-3106-4bf0-ae8d-0f2e8389e1f8',
  },
  {
    title: 'Learning Resources',
    description: 'Training, documentation, and intern resources',
    url: 'https://mge.csod.com/default.aspx?ReturnUrl=%2fglobalsso%2fgssooutboundsso.aspx%3fou_id%3d-12285%26SAMLRequest%3dfVJNb%252BMgFPwriDu2oXHsojhRdqtqI3W1aeLuYS8RxtglssH1gyj590vzoXb30AsCvTcz780wWxz7Dh3UCNqaAtMowUgZaWtt2gK%252FlI8kx4v5DETfsYEvvXs1G%252FXmFTgUgAb4pVJgPxpuBWjgRvQKuJN8u%252Fz5xFmU8GG0zkrbYbQEUKMLUt%252BtAd%252BrcavGg5bqZfNU4FfnBuBxbAQlbWcr0RFQ8D5YpF0TSbB1JG0fd7bVJj4LxwA2lnAkXuhanfZvp%252BG0P%252B4PGD2EEbUR7rzWjblv1QfNReKdoA2H9a6y3tThGgkYjgvrd7ouCGUsTzF6tKNU5%252FUL3ASUwmj1UODl5rmZ1s1dmpFpLSWZsElG8iapCKtSJrKMUlUF%252BArWImxyUB9oAK9WBpwwrsAsYVOS5ITel%252FSO05Sn91FGJ38wWl%252B9%252B6bNJZOvjK4uTcB%252FlOWarH9tS4x%252B37INDfiaJD%252Brj58j%252FJpY3HLDcxh2wfCdCF7ku%252F9sn8Wf6efX57%252F%252FZv4X%26RelayState%3dee862561-e4d7-4cfa-a248-18f77d78cdce',
  },
]

function MediaPicker({
  type,
  label,
  selectedItems,
  maxItems,
  onAdd,
  onRemove,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchMedia(event) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      if (type === 'movie') {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY

        if (!apiKey) {
          setError(
            'Movie search needs VITE_TMDB_API_KEY in your .env file.'
          )
          return
        }

        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(trimmedQuery)}&include_adult=false&language=en-US&page=1`
        )

        if (!response.ok) {
          throw new Error('Movie search failed.')
        }

        const data = await response.json()

        setResults(
          (data.results || [])
            .slice(0, 6)
            .map((movie) => ({
              id: `tmdb-${movie.id}`,
              title: movie.title,
              subtitle: movie.release_date
                ? movie.release_date.slice(0, 4)
                : 'Movie',
              image: movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : '',
            }))
        )
      }

      if (type === 'book') {
  const googleBooksApiKey =
    import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      trimmedQuery
    )}&maxResults=6&key=${googleBooksApiKey}`
  )

  if (!response.ok) {
    throw new Error('Book search failed.')
  }

  const data = await response.json()

  setResults(
    (data.items || []).map((book) => {
      const info = book.volumeInfo || {}

      return {
        id: `book-${book.id}`,
        title:
          info.title || 'Untitled Book',

        subtitle:
          (info.authors || []).join(', ') ||
          'Book',

        image:
          info.imageLinks?.thumbnail?.replace(
            'http://',
            'https://'
          ) || '',
      }
    })
  )
}
      if (type === 'album') {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(trimmedQuery)}&media=music&entity=album&limit=6`
        )

        if (!response.ok) {
          throw new Error('Album search failed.')
        }

        const data = await response.json()

        setResults(
          (data.results || []).map((album) => ({
            id: `album-${album.collectionId}`,
            title: album.collectionName || 'Untitled Album',
            subtitle: album.artistName || 'Album',
            image:
              album.artworkUrl100?.replace(
                '100x100bb',
                '300x300bb'
              ) || '',
          }))
        )
      }
    } catch (searchError) {
      setError(searchError.message || 'Search failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const atLimit = selectedItems.length >= maxItems

  return (
    <div className="media-picker">
      <div className="media-picker-heading">
        <h4>{label}</h4>
        <span>
          {selectedItems.length}/{maxItems}
        </span>
      </div>

      {selectedItems.length > 0 && (
        <div className="selected-media-grid">
          {selectedItems.map((item) => (
            <div
              className="selected-media-card"
              key={item.id}
            >
              <div className="media-cover-wrap">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                ) : (
                  <div className="media-cover-placeholder">
                    {type === 'movie'
                      ? '🎬'
                      : type === 'book'
                        ? '📚'
                        : '🎵'}
                  </div>
                )}

                <button
                  type="button"
                  className="remove-media-button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.title}`}
                >
                  ×
                </button>
              </div>

              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <>
          <form
            className="media-search-row"
            onSubmit={searchMedia}
          >
            <input
              type="search"
              value={query}
              placeholder={`Search ${label.toLowerCase()}...`}
              onChange={(event) =>
                setQuery(event.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <p className="media-search-error">
              {error}
            </p>
          )}

          {results.length > 0 && (
            <div className="media-search-results">
              {results.map((item) => (
                <button
                  type="button"
                  className="media-search-result"
                  key={item.id}
                  onClick={() => {
                    onAdd(item)
                    setResults([])
                    setQuery('')
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                    />
                  ) : (
                    <div className="media-search-placeholder">
                      +
                    </div>
                  )}

                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProfileMediaCard({ item, fallback }) {
  if (!item) {
    return (
      <div className="profile-media-card empty">
        <div className="profile-media-placeholder">
          {fallback}
        </div>
        <span>Not added yet</span>
      </div>
    )
  }

  return (
    <div className="profile-media-card">
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
        />
      ) : (
        <div className="profile-media-placeholder">
          {fallback}
        </div>
      )}

      <strong>{item.title}</strong>
      <span>{item.subtitle}</span>
    </div>
  )
}

function InternHubPage({
  profile,
  setProfile,
  currentUsername,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(
    normalizeInternProfile(profile, currentUsername)
  )
  const [hobbyText, setHobbyText] = useState(
    (profile.hobbies || []).join(', ')
  )
  const [selectedUsername, setSelectedUsername] =
    useState(currentUsername)
  const [interns, setInterns] = useState(() =>
    buildInternProfiles(
      [{ username: currentUsername, profile }],
      currentUsername,
      profile
    )
  )

  useEffect(() => {
    let cancelled = false

    async function loadInterns() {
      try {
        const response = await fetch('/api/profiles')

        if (!response.ok) {
          throw new Error(
            `Could not load profiles (${response.status}).`
          )
        }

        const profileRows = await response.json()

        if (!cancelled) {
          setInterns(
            buildInternProfiles(
              profileRows,
              currentUsername,
              profile
            )
          )
        }
      } catch (error) {
        console.error(
          'Could not load Intern Hub profiles:',
          error
        )

        if (!cancelled) {
          setInterns(
            buildInternProfiles(
              [
                {
                  username: currentUsername,
                  profile,
                },
              ],
              currentUsername,
              profile
            )
          )
        }
      }
    }

    loadInterns()

    return () => {
      cancelled = true
    }
  }, [currentUsername, profile])

  useEffect(() => {
    if (!editing) {
      const normalized = normalizeInternProfile(
        profile,
        currentUsername
      )

      setDraft(normalized)
      setHobbyText(
        normalized.hobbies.join(', ')
      )
    }
  }, [profile, currentUsername, editing])

  const selectedIntern =
    interns.find(
      (intern) =>
        intern.username === selectedUsername
    ) || interns[0]

  const selectedProfile =
    selectedIntern?.username === currentUsername
      ? normalizeInternProfile(
          profile,
          currentUsername
        )
      : selectedIntern?.profile ||
        normalizeInternProfile(null, '')

  const viewingOwnProfile =
    selectedIntern?.username === currentUsername

  function selectIntern(username) {
    if (editing) {
      setEditing(false)
    }

    setSelectedUsername(username)
  }

  function beginEditing() {
    if (!viewingOwnProfile) {
      return
    }

    const normalized = normalizeInternProfile(
      profile,
      currentUsername
    )

    setDraft({
      ...normalized,
      favoriteMovies: [
        ...normalized.favoriteMovies,
      ],
      favoriteBooks: [
        ...normalized.favoriteBooks,
      ],
      favoriteAlbums: [
        ...normalized.favoriteAlbums,
      ],
    })

    setHobbyText(
      normalized.hobbies.join(', ')
    )
    setEditing(true)
  }

  function cancelEditing() {
    const normalized = normalizeInternProfile(
      profile,
      currentUsername
    )

    setDraft(normalized)
    setHobbyText(
      normalized.hobbies.join(', ')
    )
    setEditing(false)
  }

  async function saveProfile() {
    const hobbies = hobbyText
      .split(',')
      .map((hobby) => hobby.trim())
      .filter(Boolean)
      .slice(0, 8)

    const nextProfile = normalizeInternProfile(
      {
        ...draft,
        name:
          draft.name.trim() || currentUsername,
        bio: draft.bio.trim(),
        linkedin: draft.linkedin.trim(),
        hobbies,
      },
      currentUsername
    )

    try {
      const response = await fetch(
        `/api/profile/${encodeURIComponent(currentUsername)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextProfile),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Could not save profile.'
        )
      }

      setProfile(nextProfile)
      setEditing(false)
    } catch (error) {
      console.error(
        'Could not save profile:',
        error
      )

      window.alert(
        'Your profile could not be saved to the server.'
      )
    }
  }

  function addMovie(movie) {
    setDraft((current) => {
      if (
        current.favoriteMovies.some(
          (item) => item.id === movie.id
        ) ||
        current.favoriteMovies.length >= 4
      ) {
        return current
      }

      return {
        ...current,
        favoriteMovies: [
          ...current.favoriteMovies,
          movie,
        ],
      }
    })
  }

  function removeMovie(movieId) {
    setDraft((current) => ({
      ...current,
      favoriteMovies:
        current.favoriteMovies.filter(
          (movie) => movie.id !== movieId
        ),
    }))
  }

  function addBook(book) {
    setDraft((current) => {
      if (
        current.favoriteBooks.some(
          (item) => item.id === book.id
        ) ||
        current.favoriteBooks.length >= 4
      ) {
        return current
      }

      return {
        ...current,
        favoriteBooks: [
          ...current.favoriteBooks,
          book,
        ],
      }
    })
  }

  function removeBook(bookId) {
    setDraft((current) => ({
      ...current,
      favoriteBooks:
        current.favoriteBooks.filter(
          (book) => book.id !== bookId
        ),
    }))
  }

  function addAlbum(album) {
    setDraft((current) => {
      if (
        current.favoriteAlbums.some(
          (item) => item.id === album.id
        ) ||
        current.favoriteAlbums.length >= 4
      ) {
        return current
      }

      return {
        ...current,
        favoriteAlbums: [
          ...current.favoriteAlbums,
          album,
        ],
      }
    })
  }

  function removeAlbum(albumId) {
    setDraft((current) => ({
      ...current,
      favoriteAlbums:
        current.favoriteAlbums.filter(
          (album) => album.id !== albumId
        ),
    }))
  }

function renderMediaRow(
  title,
  items,
  fallback,
  mediaType
) {
  return (
    <div
      className={`favorite-media-group ${mediaType}`}
    >
      <h4>{title}</h4>

      <div className="profile-media-grid">
        {items.length > 0
          ? items.map((item) => (
              <ProfileMediaCard
                item={item}
                fallback={fallback}
                key={item.id}
              />
            ))
          : [0, 1, 2, 3].map((slot) => (
              <ProfileMediaCard
                item={null}
                fallback={fallback}
                key={slot}
              />
            ))}
      </div>
    </div>
  )
}

  return (
    <section className="intern-hub-page">
      <div className="intern-hub-header">
        <div>
          <span className="intern-hub-kicker">
            grow together 𖧧𖡼𖤣
          </span>
          <h1>Intern Hub</h1>
         
        </div>
      </div>

      <section className="intern-garden-directory">
        <div className="intern-section-heading">
          <div>
            <span className="intern-section-label">
              Intern Garden
            </span>
            <h2>Our Interns</h2>
          </div>

          <span className="intern-count">
            {interns.length}{' '}
            {interns.length === 1
              ? 'intern'
              : 'interns'}
          </span>
        </div>

        <div className="intern-pot-grid">
          {interns.map((intern) => {
            const isCurrent =
              intern.username === currentUsername
            const isSelected =
              intern.username === selectedUsername
            const internProfile =
              normalizeInternProfile(
                intern.profile,
                intern.username
              )

            return (
              <button
                type="button"
                className={`intern-pot-card ${
                  isCurrent ? 'current-user' : ''
                } ${
                  isSelected ? 'selected' : ''
                }`}
                key={intern.username}
                onClick={() =>
                  selectIntern(intern.username)
                }
              >
                {isCurrent && (
                  <span className="your-planter-badge">
                    You
                  </span>
                )}

                <div className="mini-planter-scene">
                  <div className="mini-garden-flower">
                    {internProfile.flower}
                  </div>
                  <div className="mini-garden-stem" />
                  <div className="mini-garden-leaf left" />
                  <div className="mini-garden-leaf right" />
                  <div className="mini-garden-pot">
                    <span>
                      {internProfile.name ||
                        intern.username}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="intern-profile-card intern-directory-profile">
        <div className="intern-section-heading">
          <div>
            <span className="intern-section-label">
              {viewingOwnProfile
                ? 'Your Profile'
                : 'Intern Profile'}
            </span>
            <h2>
              {selectedProfile.name ||
                selectedIntern?.username ||
                'Intern'}
            </h2>
          </div>

          {viewingOwnProfile && !editing && (
            <button
              type="button"
              className="hub-primary-button"
              onClick={beginEditing}
            >
              Edit My Profile
            </button>
          )}
        </div>

        {editing && viewingOwnProfile ? (
          <div className="profile-editor">
            <div className="profile-field-grid">
              <label className="profile-field">
                <span>Name</span>
                <input
                  type="text"
                  value={draft.name}
                  placeholder="Your name"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="profile-field">
                <span>LinkedIn</span>
                <input
                  type="url"
                  value={draft.linkedin}
                  placeholder="https://linkedin.com/in/..."
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      linkedin: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="profile-field">
              <span>Short bio</span>
              <textarea
                value={draft.bio}
                maxLength={240}
                placeholder="A few sentences about you..."
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
              />
              <small>
                {draft.bio.length}/240
              </small>
            </label>

            <label className="profile-field">
              <span>Hobbies</span>
              <input
                type="text"
                value={hobbyText}
                placeholder="Art, movies, running, cooking..."
                onChange={(event) =>
                  setHobbyText(event.target.value)
                }
              />
              <small>
                Separate hobbies with commas.
              </small>
            </label>

            <div className="flower-picker">
              <span>Choose your flower</span>
              <div className="flower-options">
                {FLOWER_OPTIONS.map((flower) => (
                  <button
                    type="button"
                    key={flower}
                    className={
                      draft.flower === flower
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        flower,
                      }))
                    }
                  >
                    {flower}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-media-editor">
              <MediaPicker
                type="movie"
                label="Favorite Movies"
                selectedItems={draft.favoriteMovies}
                maxItems={4}
                onAdd={addMovie}
                onRemove={removeMovie}
              />

              <MediaPicker
                type="book"
                label="Favorite Books"
                selectedItems={draft.favoriteBooks}
                maxItems={4}
                onAdd={addBook}
                onRemove={removeBook}
              />

              <MediaPicker
                type="album"
                label="Favorite Albums"
                selectedItems={draft.favoriteAlbums}
                maxItems={4}
                onAdd={addAlbum}
                onRemove={removeAlbum}
              />
            </div>

            <div className="profile-editor-actions">
              <button
                type="button"
                className="hub-secondary-button"
                onClick={cancelEditing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="hub-primary-button"
                onClick={saveProfile}
              >
                Save Profile
              </button>
            </div>
          </div>
        ) : (
  <div className="profile-display">
<div className="profile-left-column">

  <div className="profile-intro">
    <div className="profile-avatar-row">
      <div className="profile-flower-avatar">
        {selectedProfile.flower}
      </div>

      {selectedProfile.linkedin && (
        <a
          className="linkedin-link"
          href={normalizeJournalLink(
            selectedProfile.linkedin
          )}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn ↗
        </a>
      )}
    </div>

  
  </div>


  <div className="hobby-section">
    <h4>Hobbies</h4>

    {selectedProfile.hobbies.length > 0 ? (
      <div className="hobby-tags">
        {selectedProfile.hobbies.map(
          (hobby) => (
            <span key={hobby}>
              {hobby}
            </span>
          )
        )}
      </div>
    ) : (
      <p className="profile-empty-copy">
        {viewingOwnProfile
          ? 'Add a few hobbies to your profile.'
          : 'No hobbies added yet.'}
      </p>
    )}
  </div>


  <div className="profile-bio-section">
    <h4>Bio</h4>

    <p>
      {selectedProfile.bio ||
        (viewingOwnProfile
          ? 'Add a short bio so other interns can get to know you.'
          : 'This intern has not added a bio yet.')}
    </p>
  </div>

</div>

  <div className="favorite-media-section">
    {renderMediaRow(
      'Favorite Movies',
      selectedProfile.favoriteMovies,
      '🎬',
      'movies'
    )}

    {renderMediaRow(
      'Favorite Books',
      selectedProfile.favoriteBooks,
      '📚',
      'books'
    )}

    {renderMediaRow(
      'Favorite Albums',
      selectedProfile.favoriteAlbums,
      '🎵',
      'albums'
    )}
  </div>
</div>
        )}
      </section>

      <section className="intern-links-section">
        <div className="intern-section-heading">
          <div>
            <span className="intern-section-label">
              Quick Access
            </span>
            <h2>Helpful Intern Links</h2>
          </div>
        </div>

        <div className="intern-links-grid">
          {INTERN_LINKS.map((link) =>
            link.url ? (
              <a
                className="intern-link-card"
                href={link.url}
                target="_blank"
                rel="noreferrer"
                key={link.title}
              >
                <strong>{link.title}</strong>
                <span>{link.description}</span>
                <small>Open ↗</small>
              </a>
            ) : (
              <div
                className="intern-link-card placeholder"
                key={link.title}
              >
                <strong>{link.title}</strong>
                <span>{link.description}</span>
                <small>Add URL in INTERN_LINKS</small>
              </div>
            )
          )}
        </div>
      </section>
    </section>
  )
}


/* =========================================
   FRUITS OF YOUR LABOR
========================================= */

const STAR_STEPS = [
  {
    key: 'situation',
    letter: 'S',
    name: 'Situation',
    prompt:
      'Set the scene. What was happening, what project or challenge were you working on, and who was involved?',
  },
  {
    key: 'task',
    letter: 'T',
    name: 'Task',
    prompt:
      'What was your responsibility or goal? Be specific about what you needed to accomplish.',
  },
  {
    key: 'action',
    letter: 'A',
    name: 'Action',
    prompt:
      'What did you personally do? Describe the steps, decisions, tools, or skills you used.',
  },
  {
    key: 'result',
    letter: 'R',
    name: 'Result',
    prompt:
      'What happened because of your work? Include an outcome, impact, lesson, or measurable result when you can.',
  },
]

const DEFAULT_FRUIT_STORIES = [
  {
    id: 'starter-fruit-1',
    title: 'STAR Story 1',
    responses: {
      situation: '',
      task: '',
      action: '',
      result: '',
    },
  },
  {
    id: 'starter-fruit-2',
    title: 'STAR Story 2',
    responses: {
      situation: '',
      task: '',
      action: '',
      result: '',
    },
  },
  {
    id: 'starter-fruit-3',
    title: 'STAR Story 3',
    responses: {
      situation: '',
      task: '',
      action: '',
      result: '',
    },
  },
]

function isFruitStoryComplete(story) {
  if (!story?.responses) {
    return false
  }

  return STAR_STEPS.every(
    (step) =>
      String(
        story.responses[step.key] || ''
      ).trim().length > 0
  )
}

function FruitsPage({
  fruitStories,
  setFruitStories,
}) {
  const [
    selectedFruitId,
    setSelectedFruitId,
  ] = useState(null)

  const [
    activeStepIndex,
    setActiveStepIndex,
  ] = useState(0)

  const [
    draft,
    setDraft,
  ] = useState(null)

  const [
    saveMessage,
    setSaveMessage,
  ] = useState('')

  const activeStep =
    STAR_STEPS[activeStepIndex]

  function openFruit(story) {
    setSelectedFruitId(story.id)
    setActiveStepIndex(0)
    setSaveMessage('')

    setDraft({
      title:
        story.title || 'STAR Story',
      responses: {
        situation:
          story.responses?.situation || '',
        task:
          story.responses?.task || '',
        action:
          story.responses?.action || '',
        result:
          story.responses?.result || '',
      },
    })
  }

  function addFruit() {
    const nextNumber =
      fruitStories.length + 1

    const newFruit = {
      id:
        `fruit-${Date.now()}-${Math.random()}`,
      title:
        `STAR Story ${nextNumber}`,
      responses: {
        situation: '',
        task: '',
        action: '',
        result: '',
      },
      createdAt:
        Date.now(),
    }

    setFruitStories(
      (current) => [
        ...current,
        newFruit,
      ]
    )

    openFruit(newFruit)
  }

  function updateDraftResponse(
    key,
    value
  ) {
    setDraft(
      (current) => ({
        ...current,
        responses: {
          ...current.responses,
          [key]:
            value,
        },
      })
    )

    setSaveMessage('')
  }

  function saveFruitStory() {
    if (
      !selectedFruitId ||
      !draft
    ) {
      return
    }

  if (!draft.title) {
  setSaveMessage(
    'Choose a skill before saving.'
  )
  return
}

const cleanedTitle = draft.title

    const savedStory = {
      title:
        cleanedTitle,
      responses: {
        ...draft.responses,
      },
      updatedAt:
        Date.now(),
    }

    setFruitStories(
      (current) =>
        current.map(
          (story) =>
            story.id ===
            selectedFruitId
              ? {
                  ...story,
                  ...savedStory,
                }
              : story
        )
    )

    setDraft(
      (current) => ({
        ...current,
        title:
          cleanedTitle,
      })
    )

    const complete =
      STAR_STEPS.every(
        (step) =>
          String(
            draft.responses[
              step.key
            ] || ''
          ).trim().length > 0
      )

    setSaveMessage(
      complete
        ? 'STAR complete! Your apple earned a gold star ★'
        : 'Progress saved.'
    )
  }

  function closeEditor() {
    setSelectedFruitId(null)
    setDraft(null)
    setActiveStepIndex(0)
    setSaveMessage('')
  }

  function previousStarStep() {
    setActiveStepIndex(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    )
  }

  function nextStarStep() {
    setActiveStepIndex(
      (current) =>
        Math.min(
          STAR_STEPS.length - 1,
          current + 1
        )
    )
  }

  return (
    <section className="fruits-page">
      <section className="fruits-intro-card">
        <div className="fruits-intro-copy">
          <span className="fruits-kicker">
            week 12 • your final harvest
          </span>

          <h1>
            Fruits of your labor
          </h1>

          <h2>
            Congrats — you’ve reached the end of your internship!
          </h2>

          <p>
            Click an apple below to turn the experience you have gained from your time at MGE
            into a STAR statement. These reflections can help you remember your impact
            and prepare examples for future behavioral interviews.
          </p>

          <a
            className="star-method-link"
            href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"
            target="_blank"
            rel="noreferrer"
          >
            Learn about the STAR method ↗
          </a>
        </div>

      <div className="fruits-intro-apple">
  <img
    src={appleBasket}
    alt="Basket of apples"
    className="fruits-intro-apple-image"
  />
</div>
      </section>

      <section className="fruit-orchard-card">
        <div className="fruit-orchard-toolbar">
          <button
            type="button"
            className="add-fruit-button"
            onClick={addFruit}
          >
            + Add Apple
          </button>

          <div>
            <span className="fruit-section-label">
              Your STAR stories
            </span>

            <h2>
              Pick an apple to begin
            </h2>
          </div>

          <span className="fruit-count">
            {fruitStories.length}{' '}
            {fruitStories.length === 1
              ? 'apple'
              : 'apples'}
          </span>
        </div>

        <div className="fruit-array">
          {fruitStories.map(
            (story, index) => {
              const complete =
                isFruitStoryComplete(
                  story
                )

              const completedSteps =
                STAR_STEPS.filter(
                  (step) =>
                    String(
                      story.responses?.[
                        step.key
                      ] || ''
                    ).trim().length >
                    0
                ).length

              return (
                <button
                  type="button"
                  className={
                    `fruit-apple-button ${
                      selectedFruitId ===
                      story.id
                        ? 'selected'
                        : ''
                    } ${
                      complete
                        ? 'complete'
                        : ''
                    }`
                  }
                  key={story.id}
                  onClick={() =>
                    openFruit(story)
                  }
                >
                  <span className="fruit-apple-wrap">
                    <span
                      className="fruit-apple"
                      aria-hidden="true"
                    >
                      <img
  src={apple}
  alt=""
  className="story-apple-image"
/>
                    </span>

                    {complete && (
                      <span
                        className="fruit-gold-star"
                        title="STAR statement complete"
                      >
                        ★
                      </span>
                    )}
                  </span>

                  <strong>
                    {story.title ||
                      `STAR Story ${
                        index + 1
                      }`}
                  </strong>

                  <small>
                    {complete
                      ? 'Complete'
                      : `${completedSteps}/4 STAR sections`}
                  </small>
                </button>
              )
            }
          )}
        </div>
      </section>

      {draft && (
        <section className="star-editor-card">
          <div className="star-editor-header">
            <div>
              <span className="fruit-section-label">
                Build your STAR
              </span>

            <select
  className="star-story-title"
  value={draft.title}
  aria-label="STAR skill"
  onChange={(event) =>
    setDraft(
      (current) => ({
        ...current,
        title: event.target.value,
      })
    )
  }
>
  <option value="">
    Choose a skill...
  </option>

  {STAR_SKILLS.map((skill) => (
    <option
      key={skill}
      value={skill}
    >
      {skill}
    </option>
  ))}
</select>
            </div>

            <button
              type="button"
              className="star-editor-close"
              onClick={closeEditor}
              aria-label="Close STAR editor"
            >
              ×
            </button>
          </div>

          <div className="star-editor-layout">
            <div className="star-acronym">
              {STAR_STEPS.map(
                (step, index) => {
                  const filled =
                    String(
                      draft.responses[
                        step.key
                      ] || ''
                    ).trim().length >
                    0

                  return (
                    <button
                      type="button"
                      key={step.key}
                      className={
                        `star-letter-button ${
                          index ===
                          activeStepIndex
                            ? 'active'
                            : ''
                        } ${
                          filled
                            ? 'filled'
                            : ''
                        }`
                      }
                      onClick={() =>
                        setActiveStepIndex(
                          index
                        )
                      }
                    >
                      <strong>
                        {step.letter}
                      </strong>

                      <span>
                        {step.name}
                      </span>
                    </button>
                  )
                }
              )}
            </div>

            <div className="star-writing-panel">
              <div className="star-step-heading">
                <div className="star-big-letter">
                  {activeStep.letter}
                </div>

                <div>
                  <span>
                    Step{' '}
                    {activeStepIndex + 1}{' '}
                    of 4
                  </span>

                  <h3>
                    {activeStep.name}
                  </h3>

                  <p>
                    {activeStep.prompt}
                  </p>
                </div>
              </div>

              <textarea
                className="star-response"
                value={
                  draft.responses[
                    activeStep.key
                  ]
                }
                placeholder={`Write your ${activeStep.name.toLowerCase()} here...`}
                onChange={(event) =>
                  updateDraftResponse(
                    activeStep.key,
                    event.target.value
                  )
                }
              />

              <div className="star-step-navigation">
                <button
                  type="button"
                  className="star-nav-button"
                  onClick={
                    previousStarStep
                  }
                  disabled={
                    activeStepIndex === 0
                  }
                >
                  ← Previous
                </button>

                <span>
                  {
                    STAR_STEPS[
                      activeStepIndex
                    ].letter
                  }
                  {' / '}
                  {
                    STAR_STEPS[
                      STAR_STEPS.length -
                        1
                    ].letter
                  }
                </span>

                <button
                  type="button"
                  className="star-nav-button"
                  onClick={nextStarStep}
                  disabled={
                    activeStepIndex ===
                    STAR_STEPS.length -
                      1
                  }
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="star-editor-footer">
            <div className="star-save-message">
              {saveMessage ||
                'Complete all four sections to earn a gold star.'}
            </div>

            <button
              type="button"
              className="save-star-button"
              onClick={saveFruitStory}
            >
              Save STAR
            </button>
          </div>
        </section>
      )}
    </section>
  )
}


/* =========================================
   LOGIN PAGE
========================================= */

function LoginPage({
  onLogin,
  onCreateAccount,
  busy,
  error,
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function submitLogin(event) {
    event.preventDefault()
    onLogin(username, password)
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img
          src={logo}
          alt="My Internship Planter"
          className="login-logo"
        />

        <div className="login-kicker">
          welcome to your internship garden 𖧧𖡼𖤣
        </div>

        <h1>Sign in to your planter</h1>

        <p className="login-copy">
          Log in to continue your internship, or make an account
          if this is your first time here.
        </p>

        <form
          className="login-form"
          onSubmit={submitLogin}
        >
          <label className="login-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              autoComplete="username"
              placeholder="Choose or enter a username"
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="Enter your password"
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </label>

          <div className="login-actions">
            <button
              type="submit"
              className="login-primary-button"
              disabled={busy}
            >
              {busy ? 'Working...' : 'Log In'}
            </button>

            <button
              type="button"
              className="login-secondary-button"
              disabled={busy}
              onClick={() =>
                onCreateAccount(username, password)
              }
            >
              Make an Account
            </button>
          </div>
        </form>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <p className="login-footnote">
          Accounts, profiles, journals, and STAR statements are
          stored through the Express backend in MySQL.
        </p>
      </section>
    </main>
  )
}


/* =========================================
   MAIN APP
========================================= */

function App() {

  /* =========================================
     BACKEND AUTH
  ========================================= */

  const [currentUser, setCurrentUser] =
    useState(() => getActiveUsername())

  const [authBusy, setAuthBusy] =
    useState(false)

  const [authError, setAuthError] =
    useState('')

  async function handleLocalLogin(username, password) {
    const normalizedUsername =
      normalizeUsername(username)

    if (!normalizedUsername || !password) {
      setAuthError('Enter both a username and password.')
      return
    }

    setAuthBusy(true)
    setAuthError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(
          data.message || 'Login failed.'
        )
        return
      }

      const authenticatedUsername =
        data.user?.username

      if (!authenticatedUsername) {
        throw new Error(
          'Login response did not include a user.'
        )
      }

      // Preserve any pre-login prototype data once, then keep using
      // the username namespace until the rest of planter data moves
      // from localStorage into MySQL.
      migrateLegacyDataOnce(
        authenticatedUsername
      )

      window.localStorage.setItem(
        AUTH_SESSION_KEY,
        authenticatedUsername
      )

      setCurrentUser(authenticatedUsername)

      // Reload so all planter state hooks initialize from this
      // user's localStorage namespace.
      window.location.reload()
    } catch (error) {
      console.error(
        'Backend login failed:',
        error
      )

      setAuthError(
        'Could not connect to the server.'
      )
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleCreateAccount(username, password) {
    const normalizedUsername =
      normalizeUsername(username)

    if (normalizedUsername.length < 3) {
      setAuthError(
        'Choose a username with at least 3 characters.'
      )
      return
    }

    if (password.length < 6) {
      setAuthError(
        'Choose a password with at least 6 characters.'
      )
      return
    }

    setAuthBusy(true)
    setAuthError('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(
          data.message ||
            'The account could not be created.'
        )
        return
      }

      const createdUsername =
        data.username || normalizedUsername

      // Preserve data from the pre-login prototype once.
      migrateLegacyDataOnce(createdUsername)

      // Do not make profile creation part of account creation.
      // Once the user is logged in, the normal profile-loading effect
      // will create a default backend profile if this user does not
      // have one yet.
      window.localStorage.setItem(
        AUTH_SESSION_KEY,
        createdUsername
      )

      setCurrentUser(createdUsername)
      window.location.reload()
    } catch (error) {
      console.error(
        'Backend account creation failed:',
        error
      )

      setAuthError(
        error instanceof TypeError
          ? 'Could not connect to the server.'
          : error.message ||
              'The account could not be created.'
      )
    } finally {
      setAuthBusy(false)
    }
  }

  function handleLocalLogout() {
    window.localStorage.removeItem(
      AUTH_SESSION_KEY
    )

    setCurrentUser('')
    window.location.reload()
  }


  /* =========================================
     CURRENT PAGE
  ========================================= */

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState('dashboard')


  /* =========================================
     CURRENT WEEK
  ========================================= */

  const [
    currentWeek,
    setCurrentWeek,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'currentWeek'
        )

      return saved
        ? Number(saved)
        : 1
    })


  /* =========================================
     HEALTH
  ========================================= */

  const [
    health,
    setHealth,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'plantHealth'
        )

      return saved
        ? Number(saved)
        : 100
    })


  /* =========================================
     WATER
  ========================================= */

  const [
    waterCount,
    setWaterCount,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'waterCount'
        )

      return saved
        ? Number(saved)
        : 0
    })


  /* =========================================
     PLANT FOOD
  ========================================= */

  const [
    plantFoodCount,
    setPlantFoodCount,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'plantFoodCount'
        )

      return saved
        ? Number(saved)
        : 0
    })


  /* =========================================
     JOURNAL ENTRIES
  ========================================= */

  const [
    journalEntries,
    setJournalEntries,
  ] =
    useState([])

  const [
    journalsLoaded,
    setJournalsLoaded,
  ] =
    useState(false)

  useEffect(() => {
    if (!currentUser) {
      setJournalEntries([])
      setJournalsLoaded(false)
      return
    }

    let cancelled = false

    async function loadJournals() {
      setJournalsLoaded(false)

      try {
        const response = await fetch(
          `/api/journals/${encodeURIComponent(currentUser)}`
        )

        if (!response.ok) {
          throw new Error(
            `Could not load journals (${response.status}).`
          )
        }

        const backendJournals =
          parseBackendJson(
            await response.json(),
            []
          )

        if (
          Array.isArray(backendJournals) &&
          backendJournals.length > 0
        ) {
          if (!cancelled) {
            setJournalEntries(backendJournals)
            setJournalsLoaded(true)
          }
          return
        }

        // One-time migration of journals already saved by the
        // local prototype in this browser.
        const savedLocalJournals =
          getUserItem('journalEntries')

        let journalsToUse = []

        if (savedLocalJournals) {
          try {
            const parsed =
              JSON.parse(savedLocalJournals)

            if (Array.isArray(parsed)) {
              journalsToUse = parsed
            }
          } catch {
            journalsToUse = []
          }
        }

        if (journalsToUse.length > 0) {
          const migrateResponse = await fetch(
            `/api/journals/${encodeURIComponent(currentUser)}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(journalsToUse),
            }
          )

          if (!migrateResponse.ok) {
            throw new Error(
              `Could not migrate journals (${migrateResponse.status}).`
            )
          }
        }

        if (!cancelled) {
          setJournalEntries(journalsToUse)
          setJournalsLoaded(true)
        }
      } catch (error) {
        console.error(
          'Could not load backend journals:',
          error
        )

        if (!cancelled) {
          setJournalEntries([])
          setJournalsLoaded(true)
        }
      }
    }

    loadJournals()

    return () => {
      cancelled = true
    }
  }, [currentUser])


  /* =========================================
     FRUITS / STAR STORIES
  ========================================= */

  const [
    fruitStories,
    setFruitStories,
  ] =
    useState([])

  const [
    starsLoaded,
    setStarsLoaded,
  ] =
    useState(false)

  useEffect(() => {
    if (!currentUser) {
      setFruitStories([])
      setStarsLoaded(false)
      return
    }

    let cancelled = false

    async function loadStars() {
      setStarsLoaded(false)

      try {
        const response = await fetch(
          `/api/stars/${encodeURIComponent(currentUser)}`
        )

        if (!response.ok) {
          throw new Error(
            `Could not load STAR statements (${response.status}).`
          )
        }

        const backendStars =
          parseBackendJson(
            await response.json(),
            []
          )

        if (
          Array.isArray(backendStars) &&
          backendStars.length > 0
        ) {
          if (!cancelled) {
            setFruitStories(backendStars)
            setStarsLoaded(true)
          }
          return
        }

        // One-time migration of STAR stories already saved by
        // the local prototype in this browser.
        const savedLocalStars =
          getUserItem('fruitStories')

        let starsToUse =
          DEFAULT_FRUIT_STORIES

        if (savedLocalStars) {
          try {
            const parsed =
              JSON.parse(savedLocalStars)

            if (Array.isArray(parsed)) {
              starsToUse = parsed
            }
          } catch {
            starsToUse =
              DEFAULT_FRUIT_STORIES
          }
        }

        const migrateResponse = await fetch(
          `/api/stars/${encodeURIComponent(currentUser)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(starsToUse),
          }
        )

        if (!migrateResponse.ok) {
          throw new Error(
            `Could not initialize STAR statements (${migrateResponse.status}).`
          )
        }

        if (!cancelled) {
          setFruitStories(starsToUse)
          setStarsLoaded(true)
        }
      } catch (error) {
        console.error(
          'Could not load backend STAR statements:',
          error
        )

        if (!cancelled) {
          setFruitStories(
            DEFAULT_FRUIT_STORIES
          )
          setStarsLoaded(true)
        }
      }
    }

    loadStars()

    return () => {
      cancelled = true
    }
  }, [currentUser])


  /* =========================================
     INTERN PROFILE
  ========================================= */

  const [
    internProfile,
    setInternProfile,
  ] =
    useState(() =>
      normalizeInternProfile(
        null,
        getActiveUsername()
      )
    )

  useEffect(() => {
    if (!currentUser) {
      return
    }

    let cancelled = false

    async function loadProfile() {
      try {
        const response = await fetch(
          `/api/profile/${encodeURIComponent(currentUser)}`
        )

        if (!response.ok) {
          throw new Error(
            `Could not load profile (${response.status}).`
          )
        }

        const backendProfile =
          parseBackendJson(
            await response.json(),
            null
          )

        if (backendProfile) {
          if (!cancelled) {
            setInternProfile(
              normalizeInternProfile(
                backendProfile,
                currentUser
              )
            )
          }
          return
        }

        const localProfile =
          getUserItem('internProfile')

        let profileToSave =
          normalizeInternProfile(
            null,
            currentUser
          )

        if (localProfile) {
          try {
            profileToSave =
              normalizeInternProfile(
                JSON.parse(localProfile),
                currentUser
              )
          } catch {
            // Keep the default profile.
          }
        }

        const saveResponse = await fetch(
          `/api/profile/${encodeURIComponent(currentUser)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileToSave),
          }
        )

        if (!saveResponse.ok) {
          throw new Error(
            `Could not initialize profile (${saveResponse.status}).`
          )
        }

        if (!cancelled) {
          setInternProfile(profileToSave)
        }
      } catch (error) {
        console.error(
          'Could not load backend profile:',
          error
        )

        if (!cancelled) {
          setInternProfile(
            normalizeInternProfile(
              null,
              currentUser
            )
          )
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [currentUser])


  /* =========================================
     DEMO DATE
  ========================================= */

  const [
    demoDate,
    setDemoDate,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'demoDate'
        )

      if (saved) {
        const [
          year,
          month,
          day,
        ] =
          saved
            .split('-')
            .map(Number)

        return new Date(
          year,
          month - 1,
          day
        )
      }

      return new Date()
    })


  /* =========================================
     COMPLETED TASKS
  ========================================= */

  const [
    completedTasks,
    setCompletedTasks,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'completedTasks'
        )

      return saved
        ? JSON.parse(saved)
        : []
    })


  /* =========================================
     TASKS THAT HAVE EARNED WATER
  ========================================= */

  const [
    rewardedTasks,
    setRewardedTasks,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'rewardedTasks'
        )

      return saved
        ? JSON.parse(saved)
        : []
    })


  /* =========================================
     TODO STATE
  ========================================= */

  const [
    todos,
    setTodos,
  ] =
    useState(() => {
      const saved =
        getUserItem(
          'todos'
        )

      return saved
        ? JSON.parse(saved)
        : []
    })

  const [
    newTodo,
    setNewTodo,
  ] =
    useState('')


  /* =========================================
     WATERING ANIMATION
  ========================================= */

  const [
    isWatering,
    setIsWatering,
  ] =
    useState(false)

  function playWaterAnimation() {
    setIsWatering(false)

    setTimeout(() => {
      setIsWatering(true)
    }, 10)

    setTimeout(() => {
      setIsWatering(false)
    }, 1200)
  }


  /* =========================================
     SAVE STATE
  ========================================= */

  useEffect(() => {
    setUserItem(
      'currentWeek',
      currentWeek
    )
  }, [currentWeek])

  useEffect(() => {
    setUserItem(
      'plantHealth',
      health
    )
  }, [health])

  useEffect(() => {
    setUserItem(
      'waterCount',
      waterCount
    )
  }, [waterCount])

  useEffect(() => {
    setUserItem(
      'plantFoodCount',
      plantFoodCount
    )
  }, [plantFoodCount])

  useEffect(() => {
    if (
      !currentUser ||
      !journalsLoaded
    ) {
      return
    }

    let cancelled = false

    async function saveJournalsToBackend() {
      try {
        const response = await fetch(
          `/api/journals/${encodeURIComponent(currentUser)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(journalEntries),
          }
        )

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({}))

          throw new Error(
            data.message ||
              `Could not save journals (${response.status}).`
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Could not save journals to backend:',
            error
          )
        }
      }
    }

    saveJournalsToBackend()

    return () => {
      cancelled = true
    }
  }, [
    journalEntries,
    currentUser,
    journalsLoaded,
  ])


  useEffect(() => {
    if (
      !currentUser ||
      !starsLoaded
    ) {
      return
    }

    let cancelled = false

    async function saveStarsToBackend() {
      try {
        const response = await fetch(
          `/api/stars/${encodeURIComponent(currentUser)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fruitStories),
          }
        )

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({}))

          throw new Error(
            data.message ||
              `Could not save STAR statements (${response.status}).`
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Could not save STAR statements to backend:',
            error
          )
        }
      }
    }

    saveStarsToBackend()

    return () => {
      cancelled = true
    }
  }, [
    fruitStories,
    currentUser,
    starsLoaded,
  ])


  useEffect(() => {
    if (
      currentWeek !==
        TOTAL_WEEKS &&
      currentPage === 'fruits'
    ) {
      setCurrentPage(
        'dashboard'
      )
    }
  }, [currentWeek, currentPage])


  useEffect(() => {
    setUserItem(
      'completedTasks',
      JSON.stringify(
        completedTasks
      )
    )
  }, [completedTasks])

  useEffect(() => {
    setUserItem(
      'rewardedTasks',
      JSON.stringify(
        rewardedTasks
      )
    )
  }, [rewardedTasks])

  useEffect(() => {
    setUserItem(
      'demoDate',
      getLocalDateKey(
        demoDate
      )
    )
  }, [demoDate])

  useEffect(() => {
    setUserItem(
      'todos',
      JSON.stringify(
        todos
      )
    )
  }, [todos])


  /* =========================================
     RESET TODOS ON NEW REAL DAY
  ========================================= */

  useEffect(() => {
    const today =
      getLocalDateKey()

    const lastTodoDate =
      getUserItem(
        'lastTodoDate'
      )

    if (!lastTodoDate) {
      setUserItem(
        'lastTodoDate',
        today
      )

      return
    }

    if (
      lastTodoDate !== today
    ) {
      setTodos([])

      setUserItem(
        'lastTodoDate',
        today
      )
    }
  }, [])


  /* =========================================
     REAL DAILY HEALTH LOSS
  ========================================= */

  useEffect(() => {
    let midnightTimer

    function applyDailyHealthLoss() {
      const today =
        getLocalDateKey()

      const lastHealthDate =
        getUserItem(
          'lastHealthDate'
        )

      if (!lastHealthDate) {
        setUserItem(
          'lastHealthDate',
          today
        )

        return
      }

      const daysPassed =
        getDaysBetween(
          lastHealthDate,
          today
        )

      if (
        daysPassed > 0
      ) {
        setHealth(
          (currentHealth) =>
            Math.max(
              0,
              currentHealth -
                daysPassed * 5
            )
        )

        setUserItem(
          'lastHealthDate',
          today
        )
      }
    }

    function scheduleMidnightCheck() {
      const now =
        new Date()

      const nextMidnight =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          1
        )

      const timeUntilMidnight =
        nextMidnight - now

      midnightTimer =
        setTimeout(() => {
          applyDailyHealthLoss()

          setTodos([])

          setUserItem(
            'lastTodoDate',
            getLocalDateKey()
          )

          scheduleMidnightCheck()
        }, timeUntilMidnight)
    }

    applyDailyHealthLoss()
    scheduleMidnightCheck()

    return () => {
      clearTimeout(
        midnightTimer
      )
    }
  }, [])


  /* =========================================
     ADD TODO
  ========================================= */

  function addTodo() {
    const text =
      newTodo.trim()

    if (!text) {
      return
    }

    const todo = {
      id:
        Date.now(),
      text:
        text,
      completed:
        false,
    }

    setTodos(
      (current) => [
        ...current,
        todo,
      ]
    )

    setNewTodo('')
  }


  /* =========================================
     CHECK / UNCHECK TODO
  ========================================= */

  function toggleTodo(id) {
    setTodos(
      (current) =>
        current.map(
          (todo) => {
            if (
              todo.id === id
            ) {
              return {
                ...todo,
                completed:
                  !todo.completed,
              }
            }

            return todo
          }
        )
    )
  }


  /* =========================================
     RESET CALENDAR
  ========================================= */

  function resetCalendar() {
    setDemoDate(
      new Date()
    )
  }


  /* =========================================
     RESET TASKS
  ========================================= */

  function resetTasks() {
    setCompletedTasks([])
    setRewardedTasks([])
    setWaterCount(0)
  }


  /* =========================================
     NEXT DEMO DAY
  ========================================= */

  function nextDemoDay() {
    setDemoDate(
      (currentDate) => {
        const nextDate =
          new Date(
            currentDate
          )

        nextDate.setDate(
          nextDate.getDate() + 1
        )

        return nextDate
      }
    )

    setHealth(
      (currentHealth) =>
        Math.max(
          0,
          currentHealth - 5
        )
    )

    setTodos([])
  }


  /* =========================================
     WEEK ARROWS
  ========================================= */

  function previousWeek() {
    setCurrentWeek(
      (week) =>
        Math.max(
          1,
          week - 1
        )
    )
  }

  function nextWeek() {
    setCurrentWeek(
      (week) =>
        Math.min(
          TOTAL_WEEKS,
          week + 1
        )
    )
  }


  /* =========================================
     TASK COMPLETION
  ========================================= */

  function toggleTask(index) {
    const isCompleted =
      completedTasks.includes(index)

    if (isCompleted) {
      setCompletedTasks(
        (current) =>
          current.filter(
            (taskIndex) =>
              taskIndex !== index
          )
      )

      return
    }

    setCompletedTasks(
      (current) => [
        ...current,
        index,
      ]
    )

    if (
      !rewardedTasks.includes(index)
    ) {
      setWaterCount(
        (current) =>
          current + 1
      )

      setRewardedTasks(
        (current) => [
          ...current,
          index,
        ]
      )
    }
  }

 /* =========================================
     use plant food
  ========================================= */

function usePlantFood() {
  if (plantFoodCount <= 0) {
    return
  }

  setPlantFoodCount(
    (current) => current - 1
  )

  setHealth(100)
}


  /* =========================================
     WATER PLANT
  ========================================= */

  function waterPlant() {
    if (
      waterCount <= 0
    ) {
      return
    }

    if (
      health >= 100
    ) {
      return
    }

    setWaterCount(
      (current) =>
        current - 1
    )

    setHealth(
      (current) =>
        Math.min(
          100,
          current + 5
        )
    )

    playWaterAnimation()
  }


  /* =========================================
     SAVE JOURNAL ENTRY
  ========================================= */

  function saveJournalEntry({
    entryId,
    title,
    stageId,
    entryType,
    content,
    attachments,
  }) {
    const now =
      Date.now()

    const displayDate =
      new Date(now)
        .toLocaleDateString(
          'en-US',
          {
            month:
              'long',
            day:
              'numeric',
            year:
              'numeric',
          }
        )

    const wordCount =
      getJournalWordCount(
        content
      )

    const existingEntry =
      entryId
        ? journalEntries.find(
            (entry) =>
              entry.id === entryId
          )
        : null

    if (existingEntry) {
      setJournalEntries(
        (current) =>
          current.map(
            (entry) => {
              if (
                entry.id === entryId
              ) {
                return {
                  ...entry,
                  title,
                  stageId,
                  entryType,
                  content,
                  attachments,
                  wordCount,
                  updatedAt:
                    now,
                  displayDate,
                }
              }

              return entry
            }
          )
      )

      return {
        created:
          false,
        entryId,
      }
    }

    const newEntry = {
      id:
        now,
      title,
      stageId,
      entryType,
      content,
      attachments,
      weekCreated:
        currentWeek,
      createdAt:
        now,
      updatedAt:
        now,
      displayDate,
      wordCount,
      plantFoodRewarded:
        true,
    }

    setJournalEntries(
      (current) => [
        ...current,
        newEntry,
      ]
    )

    setPlantFoodCount(
      (current) =>
        current + 1
    )

    return {
      created:
        true,
      entryId:
        newEntry.id,
    }
  }


  /* =========================================
     DELETE JOURNAL ENTRY
  ========================================= */

  function deleteJournalEntry(entryId) {
    const entryToDelete =
      journalEntries.find(
        (entry) =>
          entry.id === entryId
      )

    if (!entryToDelete) {
      return
    }

    setJournalEntries(
      (current) =>
        current.filter(
          (entry) =>
            entry.id !== entryId
        )
    )

    // Every saved journal entry earns +1 Plant Food,
    // so deleting an entry removes 1 Plant Food.
    setPlantFoodCount(
      (current) =>
        Math.max(0, current - 1)
    )
  }


  /* =========================================
     CURRENT PLANT STAGE
  ========================================= */

  const plantStageIndex =
    Math.min(
      currentWeek - 1,
      plantStages.length - 1
    )

  const currentPlantImage =
    plantStages[
      plantStageIndex
    ]


  /* =========================================
     AUTH GATE
  ========================================= */

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLocalLogin}
        onCreateAccount={handleCreateAccount}
        busy={authBusy}
        error={authError}
      />
    )
  }


  /* =========================================
     RENDER
  ========================================= */

  return (
    <main className="page">

      {/* HEADER */}

      <header className="header">
        <img
          src={logo}
          alt="My Internship Planter"
          className="logo"
        />

        <nav className="nav">
          <button
            type="button"
            className={
              `nav-link ${
                currentPage ===
                'dashboard'
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              setCurrentPage(
                'dashboard'
              )
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            className={
              `nav-link ${
                currentPage ===
                'journal'
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              setCurrentPage(
                'journal'
              )
            }
          >
            Journal
          </button>


          <button
            type="button"
            className={
              `nav-link ${
                currentPage ===
                'internHub'
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              setCurrentPage(
                'internHub'
              )
            }
          >
            Intern Hub
          </button>


          {currentWeek ===
            TOTAL_WEEKS && (
            <button
              type="button"
              className={
                `nav-link ${
                  currentPage ===
                  'fruits'
                    ? 'active'
                    : ''
                }`
              }
              onClick={() =>
                setCurrentPage(
                  'fruits'
                )
              }
            >
              Fruits
            </button>
          )}

        </nav>

        <div className="header-account">
          <div className="header-account-copy">
            <strong>{currentUser}</strong>
            <span>backend account</span>
          </div>

          <button
            type="button"
            className="sign-out-button"
            onClick={handleLocalLogout}
          >
            Sign out
          </button>
        </div>
      </header>


      {/* DASHBOARD */}

      {currentPage ===
        'dashboard' && (
        <>
          <ProgressCard
            currentWeek={
              currentWeek
            }
            previousWeek={
              previousWeek
            }
            nextWeek={
              nextWeek
            }
            health={
              health
            }
            waterCount={
              waterCount
            }
            plantFoodCount={
              plantFoodCount
            }
              usePlantFood={
                usePlantFood
            }

          />

          <TasksCard
            completedTasks={
              completedTasks
            }
            toggleTask={
              toggleTask
            }
            resetTasks={
              resetTasks
            }
          />

          <TodoNote
            todos={
              todos
            }
            newTodo={
              newTodo
            }
            setNewTodo={
              setNewTodo
            }
            addTodo={
              addTodo
            }
            toggleTodo={
              toggleTodo
            }
          />

          <CalendarControl
            demoDate={
              demoDate
            }
            nextDay={
              nextDemoDay
            }
            resetCalendar={
              resetCalendar
            }
          />

          <div className="plant-area">
            <img
              src={
                currentPlantImage
              }
              alt={
                `Plant stage for week ${currentWeek}`
              }
              className={
                `plant ${
                  isWatering
                    ? 'plant-grow'
                    : ''
                }`
              }
            />

            <div
              className={
                `water-animation ${
                  isWatering
                    ? 'active'
                    : ''
                }`
              }
            >
              <div className="watering-can-animation">
                🚿
              </div>

              <div className="falling-water">
                💧
                <br />

                &nbsp;&nbsp;💧
                <br />

                💧
              </div>
            </div>
          </div>

          <div className="plant-buttons">
      
              <button
                 type="button"
                  className="plant-action food-button"
                   onClick={usePlantFood}
                     disabled={plantFoodCount <= 0}
              >
              Plant Food 
            </button>

            <button
              type="button"
              className="plant-action water-button"
              onClick={
                waterPlant
              }
              disabled={
                waterCount === 0 ||
                health >= 100
              }
            >
              Water Plant
            </button>
          </div>

         <JournalCard
  currentWeek={currentWeek}
  openJournal={() =>
    setCurrentPage('journal')
  }
/>
        </>
      )}


      {/* JOURNAL PAGE */}

      {currentPage ===
        'journal' && (
       <JournalPage
  currentWeek={currentWeek}
  journalEntries={journalEntries}
  saveJournalEntry={saveJournalEntry}
  deleteJournalEntry={deleteJournalEntry}
/>
      )}


      {/* INTERN HUB */}

      {currentPage ===
        'internHub' && (
        <InternHubPage
          profile={internProfile}
          setProfile={setInternProfile}
          currentUsername={currentUser}
        />
      )}


      {/* FRUITS OF YOUR LABOR */}

      {currentPage ===
        'fruits' &&
        currentWeek ===
          TOTAL_WEEKS && (
        <FruitsPage
          fruitStories={
            fruitStories
          }
          setFruitStories={
            setFruitStories
          }
        />
      )}
    </main>
  )
}


export default App