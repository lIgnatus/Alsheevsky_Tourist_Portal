/**
 * Приёмник заявок сайта «Туристический портал Альшеевского района».
 *
 * Все формы сайта отправляют сюда POST-запрос с двумя полями:
 *   sheet — название формы, оно же имя листа («Заявки на туры», «Отзывы» и т. д.);
 *   data  — JSON со строкой заявки: подписи полей формы → значения.
 * Скрипт сам создаёт лист, если его ещё нет, и дописывает недостающие столбцы в первую строку.
 *
 * Установка: README.md в этой же папке. Адрес веб-приложения вписать в assets/js/data.js → D.forms.endpoint.
 */

/* Листы, которые создаёт setupSheets(). Названия совпадают с data-sheet у форм на сайте. */
const SHEETS = [
  'Заявки на туры',
  'Отзывы',
  'Заказы сувениров',
  'Заявки на размещение',
  'Узнать об открытии',
  'Пригласить фильм',
  'Стать партнёром'
];

/* Первые столбцы на каждом листе, остальные добавляются по подписям полей формы */
const FIRST = ['Дата и время', 'Страница', 'Объект'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = (e && e.parameter) || {};
    const name = cleanName(p.sheet || 'Заявки');
    let data;
    try { data = JSON.parse(p.data || '{}'); } catch (err) { data = { 'Данные': String(p.data || '') }; }

    const row = { 'Дата и время': new Date() };
    Object.keys(data).forEach(k => { row[String(k).slice(0, 120)] = safe(data[k]); });

    const sh = sheetFor(name);
    let head = headOf(sh);
    const add = Object.keys(row).filter(k => head.indexOf(k) < 0);
    if (add.length) {
      head = head.concat(add);
      writeHead(sh, head);
    }
    sh.appendRow(head.map(h => (h in row ? row[h] : '')));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Открыть адрес веб-приложения в браузере: должно появиться «Приёмник заявок работает» */
function doGet() {
  return ContentService.createTextOutput('Приёмник заявок работает');
}

/* Запустить один раз вручную: создаёт все листы с заголовками заранее */
function setupSheets() {
  SHEETS.forEach(n => {
    const sh = sheetFor(n);
    if (!headOf(sh).length) writeHead(sh, FIRST.slice());
  });
}

function sheetFor(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function headOf(sh) {
  const n = sh.getLastColumn();
  return n ? sh.getRange(1, 1, 1, n).getValues()[0].map(String).filter(Boolean) : [];
}

function writeHead(sh, head) {
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#EEF2E7');
  sh.setFrozenRows(1);
}

/* Имя листа: без запрещённых символов и не длиннее 90 знаков */
function cleanName(s) {
  return String(s).replace(/[\[\]\*\?\/\\:]/g, ' ').trim().slice(0, 90) || 'Заявки';
}

/* Текст из формы не должен выполняться как формула: =, +, -, @ в начале экранируем апострофом */
function safe(v) {
  const s = String(v == null ? '' : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
