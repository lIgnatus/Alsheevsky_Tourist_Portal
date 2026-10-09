"""База рассказов краеведов для экскурсии.

Читает посты ВКонтакте из «05 Источники/ВК — посты», находит абзацы про места карты
и собирает короткие цитаты с источником и ссылкой. Результат:
  assets/js/posts.js          — window.POSTS для прототипа (экскурсия «Краеведы рассказывают»);
  data/posty-kraevedov.json   — то же для будущей базы.

Запуск из папки прототипа:  python tools/posts_index.py "../05 Источники/ВК — посты"

На рабочем сайте это заменяет поиск по базе: посты режутся на куски, связываются с местами,
редактор подтверждает связь, а языковая модель пишет экскурсию только по подтверждённым кускам.
"""
import re, json, sys, os, glob

SRC = sys.argv[1] if len(sys.argv) > 1 else '../05 Источники/ВК — посты'

# кто написал: по имени файла
AUTHORS = {
    'Вязовка': 'группа «Вязовка • Раев • Раевка»',
    'Земля Альшея': 'паблик «Земля Альшея»',
    'Александр Казанцев': 'краевед Александр Казанцев',
}

# как место называют в постах
PLACES = {
    'susaktau':      [r'сусак[\s-]?тау'],
    'satyrtau':      [r'сатыр[\s-]?тау'],
    'slak':          [r'слаковск\w* водохранилищ', r'водохранилищ\w* (у|возле|около) слак'],
    'tashly-lake':   [r'озер\w* ташлы', r'ташлинск\w* (пруд|озер)'],
    'tamgi':         [r'тамг'],
    'chekhov':       [r'чехов\w*.{0,60}(аксёнов|аксенов|кумыс|санатори|1901|книппер)', r'(аксёнов|аксенов|1901).{0,60}чехов'],
    'kraeved':       [r'альшеевск\w* (историко[\s-]?)?краеведческ\w* музе', r'музе\w* (в|села) раевск'],
    'vokzal':        [r'вокзал\w*.{0,40}раевк', r'станци\w* раевк', r'раевск\w* вокзал'],
    'bashnya-raevka':[r'водонапорн\w* башн\w*.{0,60}раевк', r'раевк\w*.{0,60}водонапорн\w* башн'],
    'vozdvizhenka':  [r'воздвиженк', r'крестовоздвиженск'],
    'avryuzovo':     [r'аврюзов'],
    'asylykul':      [r'асылыкул', r'аслыкул', r'аслы[\s-]?куль'],
    'sharlama':      [r'шарлам'],
    'narystau':      [r'нарыс[\s-]?тау'],
    'deev':          [r'деев\w*.{0,60}(особняк|знаменк|дом)', r'(особняк|знаменк).{0,60}деев'],
    'ivanov':        [r'иванов\w*.{0,40}(нарспи|слакбаш)', r'слакбаш'],
    'aksakov':       [r'аксаков\w*.{0,40}(надеждин|музе|имени)', r'надеждин\w*.{0,40}аксаков'],
    'tsvetaeva':     [r'цветаев\w*.{0,60}(усень|1911)', r'усень[\s-]?иванов'],
    'hakimov':       [r'ахияр\w* хакимов', r'хакимов\w*.{0,30}музе'],
    'davl-museum':   [r'давлекановск\w* (историко[\s-]?)?краеведческ\w* музе'],
    'bashnya-davl':  [r'водонапорн\w* башн\w*.{0,60}давлеканов', r'давлеканов\w*.{0,60}водонапорн\w* башн'],
    'cafe-triumf':   [r'кафе «?триумф'],
}
# объявления, поздравления и прочее, что не годится в экскурсию
NOISE = re.compile(r'приглаша|состоится|регистрац|конкурс|поздравля|подписывайтесь|ставьте|лайк|репост|голосован|розыгрыш|акци[яи]|скидк|звоните|тел\.|\+7|http|#', re.I)
# версии, которые заказчик просил не использовать
BANNED = [re.compile(r'(на (средства|деньги|счёт|счет)|построил|построен\w*)[^.]{0,60}(раев\w*)[^.]{0,60}вокзал|вокзал[^.]{0,60}(на (средства|деньги|счёт|счет)|построил|построен\w*)[^.]{0,40}раев', re.I),
          re.compile(r'(на (средства|деньги|пожертвовани\w*)|за сч[её]т)[^.]{0,80}раев', re.I),
          re.compile(r'раев\w*[^.]{0,80}(профинансир|финансир|вклад в строительств|построил)', re.I),
          re.compile(r'(профинансир|финансир|вклад в строительств)[^.]{0,80}(раев|вокзал)', re.I),
          re.compile(r'салават\w* юлаев', re.I), re.compile(r'XIV век', re.I)]
# архивные описи, протоколы и отчёты о встречах: в экскурсию не годятся
DRY = re.compile(r'кант\. комисси|припущенник|гражд?\.|гр\. |оп\.\s?\d|д\.\s?\d|№|с/с|протокол|спасибо|мы провели|мы продолжаем|лист\w* \d', re.I)

def clean(t):
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', t)          # картинки
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)        # ссылки
    t = re.sub(r'https?://\S+', '', t)                    # голые ссылки
    t = re.sub(r'#\w+', '', t)                            # хештеги
    t = re.sub(r'\s+[–-]\s+', ', ', t)                    # короткие тире тоже
    t = re.sub(r'[\U0001F000-\U0001FFFF☀-➿️]', '', t)  # эмодзи
    t = t.replace(' ', ' ')
    t = re.sub(r'\s+—\s+', ', ', t)                       # тире в предложениях убираем
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

ABBR = re.compile(r'\b(оз|гг|г|д|с|ст|им|ул|р|т|тыс|руб|см|кв|п|пос|дер)\.\s', re.I)
def sentences(par):
    par = ABBR.sub(lambda m: m.group(0).replace('. ', '.\u2060 '), par)   # «оз. Аслыкуль» не рвём
    parts = re.split(r'(?<=[^А-ЯЁA-Z\s][.!?…])\s+(?=[А-ЯЁA-Z«])|\s*•\s*', par)
    return [x.replace('\u2060', '').strip() for x in parts if x and x.strip()]

posts = []
for f in sorted(glob.glob(os.path.join(SRC, '*.md'))):
    name = os.path.basename(f)
    if name.lower().startswith('readme'): continue
    author = next((v for k, v in AUTHORS.items() if name.startswith(k)), name)
    text = open(f, encoding='utf8').read()
    for block in re.split(r'\n(?=## \d{4}-\d{2}-\d{2} · )', text):
        m = re.match(r'## (\d{4}-\d{2}-\d{2}) · (\S+)', block)
        if not m: continue
        body = block[m.end():].split('\n---')[0]
        body = '\n'.join(l for l in body.split('\n') if not l.startswith('>'))  # без репостов
        posts.append({'date': m.group(1), 'url': m.group(2), 'author': author, 'body': body})

APPROVED = json.load(open(os.path.join(os.path.dirname(__file__), 'posts_approved.json'), encoding='utf8')) if os.path.exists(os.path.join(os.path.dirname(__file__), 'posts_approved.json')) else {}
out, review = {}, {}
for pid, pats in PLACES.items():
    rx = [re.compile(p, re.I) for p in pats]
    cands = []
    for po in posts:
        for par in re.split(r'\n\s*\n', po['body']):
            par = '\n'.join(l for l in par.split('\n') if not (sum(c.isalpha() for c in l) > 8 and l.upper() == l))  # заголовки капсом
            par = clean(par)
            if len(par) < 120 or NOISE.search(par) or DRY.search(par) or any(b.search(par) for b in BANNED): continue
            if sum(ch.isdigit() for ch in par) / len(par) > 0.04: continue
            if not any(r.search(par) for r in rx): continue
            if par.isupper() or par.count('«') > 6: continue
            ss = sentences(par)
            # окно из 1–3 предложений вокруг первого упоминания, не длиннее 420 знаков
            ss = [x for x in ss if not (x.isupper() and len(x) > 12)]   # заголовки капсом
            hit = next((i for i, x in enumerate(ss) if any(r.search(x) for r in rx)), None)
            if hit is None: continue
            pick = ss[hit:hit + 3]
            while len(' '.join(pick)) > 420 and len(pick) > 1: pick = pick[:-1]
            # предыдущее предложение берём, если текущее на него ссылается («Он…», «Здесь…») или оно короткое («Шёл 1909 год.»)
            if hit > 0 and (re.match(r'(Он|Она|Оно|Они|Это|Здесь|Там|Его|Её|Ее|Их|Тогда)', ss[hit]) or len(ss[hit - 1]) < 40) and len(' '.join(ss[hit - 1:hit] + pick)) <= 420: pick = ss[hit - 1:hit] + pick
            snip = ' '.join(pick)
            if not (90 <= len(snip) <= 440) or not snip[-1] in '.!?…»': continue
            score = sum(len(r.findall(par)) for r in rx) * 3 + (2 if re.search(r'\d{4}', snip) else 0) - (len(snip) > 380)
            cands.append((score, po['date'], snip, po))
    cands.sort(key=lambda c: (-c[0], c[1]))
    uniq, seen = [], set()
    for sc, d, snip, po in cands:
        if po['url'] in seen: continue
        seen.add(po['url']); uniq.append({'t': snip, 'src': po['author'], 'date': po['date'], 'url': po['url'].replace('vk.com', 'vk.ru')})
    review[pid] = uniq[:10]
    # в базу идут только одобренные редактором (tools/posts_approved.json: место → ссылки на посты)
    ok = APPROVED.get(pid, [])
    chosen = [u for u in uniq if u['url'] in ok]
    if chosen: out[pid] = chosen[:3]

os.makedirs('data', exist_ok=True)
json.dump(review, open(os.path.join(os.path.dirname(__file__), 'posts_candidates.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
json.dump(out, open('data/posty-kraevedov.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)
open('assets/js/posts.js', 'w', encoding='utf8').write(
    '/* Рассказы краеведов из постов ВКонтакте для экскурсии. Собрано скриптом tools/posts_index.py, вручную не править. */\n'
    'window.POSTS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('постов', len(posts), '| мест с рассказами', len(out), {k: len(v) for k, v in out.items()})
