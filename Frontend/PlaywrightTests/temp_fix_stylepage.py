from pathlib import Path

path = Path('ui_pages/StylePage.ts')
text = path.read_text(encoding='utf-8')
replacements = {
    "'xpath=//div[text()=\"Let's find your style.\"]'": "`xpath=//div[text=\"Let's find your style.\"]`",
    "'xpath=//div[text()=\"What's your style match? You have 3 ways to explore.\"]'": "`xpath=//div[text=\"What's your style match? You have 3 ways to explore.\"]`",
    "'xpath=//div[text()=\"Answer 4 questions, and we'll identify your ideal style.\"]'": "`xpath=//div[text=\"Answer 4 questions, and we'll identify your ideal style.\"]`",
    "'xpath=//div[text()=\"What's your style personality? Take the quiz.\"]'": "`xpath=//div[text=\"What's your style personality? Take the quiz.\"]`",
    "'xpath=//div[text()=\"You're four questions away from discovering your perfect style.\"]'": "`xpath=//div[text=\"You're four questions away from discovering your perfect style.\"]`",
}
count = 0
for old, new in replacements.items():
    n = text.count(old)
    if n:
        count += n
        text = text.replace(old, new)
        print(f'Replaced {n} occurrence(s) of: {old}')

if count:
    path.write_text(text, encoding='utf-8')
    print(f'Wrote updated file with {count} replacements.')
else:
    print('No replacements made.')
