# 🤖 Локальные AI модели для проекта
## Бесплатные нейронки, работающие локально

**Дата:** 1 октября 2025
**Цель:** Подключить бесплатные AI модели, которые работают на твоём компьютере

---

## 🎯 Зачем это нужно

### Преимущества локальных моделей:
- ✅ **Бесплатно** — нет API ключей, нет лимитов
- ✅ **Приватность** — код не уходит в интернет
- ✅ **Скорость** — нет задержек сети
- ✅ **Офлайн** — работает без интернета

### Что можно делать:
- Code completion (автодополнение)
- Code review (проверка кода)
- Bug finding (поиск багов)
- Documentation generation (генерация документации)
- Test generation (создание тестов)

---

## 🚀 Вариант 1: Ollama (РЕКОМЕНДУЮ!)

### Что это?
**Ollama** — это Docker для AI моделей. Скачал, запустил — работает.

### Установка

#### macOS:
```bash
brew install ollama
```

#### Windows:
Скачай с [ollama.com](https://ollama.com) и установи.

### Запуск

```bash
# Старт Ollama (один раз)
ollama serve

# Скачать модель DeepSeek Coder (лучшая для кода)
ollama pull deepseek-coder:6.7b

# Альтернативы (если нужно меньше RAM):
ollama pull codellama:7b          # 4GB RAM
ollama pull deepseek-coder:1.3b   # 1GB RAM (быстрая, но слабее)
```

### Использование в проекте

#### 1. Code Review через Ollama

```javascript
// agents/integrations/ollama-reviewer.js
const fetch = require('node-fetch');

class OllamaReviewer {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.model = 'deepseek-coder:6.7b';
  }

  async reviewCode(code, context = '') {
    const prompt = `You are a senior code reviewer. Review this code and find issues:

Context: ${context}

Code:
\`\`\`javascript
${code}
\`\`\`

Find:
1. Bugs
2. Security issues
3. Performance problems
4. Code style issues

Format as JSON:
{
  "issues": [
    {"type": "bug", "line": 10, "message": "...", "severity": "high"},
    ...
  ],
  "suggestions": ["..."]
}`;

    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    return JSON.parse(data.response);
  }
}

module.exports = OllamaReviewer;
```

#### 2. Code Completion

```javascript
// agents/integrations/ollama-autocomplete.js
class OllamaAutocomplete {
  async complete(code, cursorPosition) {
    const before = code.substring(0, cursorPosition);
    const after = code.substring(cursorPosition);

    const prompt = `Complete this code:

${before}<CURSOR>${after}

Continue from <CURSOR>:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: 'deepseek-coder:6.7b',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  }
}
```

#### 3. Bug Finder

```javascript
class OllamaBugFinder {
  async findBugs(code, fileName) {
    const prompt = `Find bugs in this ${fileName}:

\`\`\`javascript
${code}
\`\`\`

List all potential bugs with:
- Line number
- Bug description
- How to fix`;

    // ... аналогично reviewCode
  }
}
```

### Интеграция с агентами

```javascript
// Обновляем REVIEWER agent
const OllamaReviewer = require('./integrations/ollama-reviewer');

class ReviewerAgent {
  constructor() {
    this.ollamaReviewer = new OllamaReviewer();
  }

  async review(code, context) {
    // 1. Claude делает review
    const claudeReview = this.doClaudeReview(code);

    // 2. Ollama делает review (параллельно, если запущен)
    let ollamaReview = null;
    try {
      ollamaReview = await this.ollamaReviewer.reviewCode(code, context);
    } catch (error) {
      console.log('Ollama не запущен, используем только Claude');
    }

    // 3. Объединяем результаты
    return this.mergeReviews(claudeReview, ollamaReview);
  }
}
```

### Системные требования

| Модель | RAM | Скорость | Качество |
|--------|-----|----------|----------|
| deepseek-coder:1.3b | 1GB | Быстро | Хорошо |
| codellama:7b | 4GB | Средне | Отлично |
| deepseek-coder:6.7b | 5GB | Средне | Отлично |
| deepseek-coder:33b | 20GB | Медленно | Превосходно |

**Рекомендация:** Если у тебя 8GB RAM — используй `deepseek-coder:6.7b`

---

## 🔥 Вариант 2: LM Studio

### Что это?
**LM Studio** — GUI приложение для запуска моделей. Проще, чем Ollama.

### Установка
1. Скачай с [lmstudio.ai](https://lmstudio.ai)
2. Установи
3. Открой LM Studio
4. Search: "deepseek coder"
5. Download
6. Start Server (кнопка)

### API аналогичен OpenAI

```javascript
const fetch = require('node-fetch');

async function codeReview(code) {
  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-coder',
      messages: [
        { role: 'system', content: 'You are a code reviewer' },
        { role: 'user', content: `Review this code:\n\n${code}` }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## ⚡ Вариант 3: llama.cpp (для продвинутых)

### Что это?
**llama.cpp** — самый быстрый способ запуска моделей (C++).

### Установка

```bash
# macOS
brew install llama.cpp

# Скачать модель
wget https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF/resolve/main/deepseek-coder-6.7b-instruct.Q4_K_M.gguf

# Запустить сервер
llama-server -m deepseek-coder-6.7b-instruct.Q4_K_M.gguf --port 8080
```

### API

```javascript
fetch('http://localhost:8080/completion', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Review this code: ...',
    n_predict: 512
  })
});
```

---

## 📊 Сравнение вариантов

| Решение | Простота | Скорость | Гибкость | RAM |
|---------|----------|----------|----------|-----|
| **Ollama** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4-8GB |
| **LM Studio** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 4-8GB |
| **llama.cpp** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 2-4GB |

**Рекомендация:** Начни с **Ollama** (проще всего)

---

## 🎯 Какие модели использовать

### Для кода (code generation, review):
1. **DeepSeek Coder 6.7B** (лучшая для кода)
2. **CodeLlama 7B** (хорошая альтернатива)
3. **Qwen Coder 7B** (новая, хорошая)

### Для текста (documentation):
1. **Mistral 7B** (универсальная)
2. **Llama 3 8B** (очень умная)

### Для быстроты (если мало RAM):
1. **DeepSeek Coder 1.3B** (всего 1GB)
2. **TinyLlama 1.1B** (очень быстрая)

---

## 🔧 Интеграция в проект

### Создам агента OLLAMA-ASSISTANT

```javascript
// agents/integrations/ollama-assistant.js
class OllamaAssistant {
  constructor() {
    this.available = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      await fetch('http://localhost:11434/api/tags');
      this.available = true;
      console.log('✅ Ollama доступен');
    } catch {
      this.available = false;
      console.log('ℹ️  Ollama не запущен (опционально)');
    }
  }

  async generate(prompt, model = 'deepseek-coder:6.7b') {
    if (!this.available) {
      throw new Error('Ollama не запущен');
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({ model, prompt, stream: false })
    });

    const data = await response.json();
    return data.response;
  }

  // Code review
  async reviewCode(code) {
    return await this.generate(`Review this code and find issues:\n\n${code}`);
  }

  // Generate tests
  async generateTests(code, className) {
    return await this.generate(`Generate Mocha unit tests for:\n\n${code}`);
  }

  // Find bugs
  async findBugs(code) {
    return await this.generate(`Find all bugs in:\n\n${code}`);
  }

  // Explain code
  async explainCode(code) {
    return await this.generate(`Explain what this code does:\n\n${code}`);
  }
}

module.exports = OllamaAssistant;
```

### Использование

```javascript
// В любом агенте
const ollama = new OllamaAssistant();

if (ollama.available) {
  // Двойная проверка: Claude + Ollama
  const claudeReview = await claudeReviewCode(code);
  const ollamaReview = await ollama.reviewCode(code);

  // Комбинируем результаты
  const combined = mergeReviews(claudeReview, ollamaReview);
}
```

---

## 📋 Пошаговая инструкция

### Шаг 1: Установи Ollama
```bash
brew install ollama  # macOS
# или скачай с ollama.com для Windows
```

### Шаг 2: Запусти Ollama
```bash
ollama serve
```
Оставь это окно терминала открытым.

### Шаг 3: Скачай модель (в новом терминале)
```bash
ollama pull deepseek-coder:6.7b
```

### Шаг 4: Протестируй
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-coder:6.7b",
  "prompt": "Write a function that checks if a number is prime",
  "stream": false
}'
```

### Шаг 5: Интегрируй в проект
Я создам файл `agents/integrations/ollama-assistant.js` когда скажешь.

---

## ⚠️ Важные замечания

### Ollama опционален
- Если Ollama не запущен — ничего не сломается
- Claude будет работать как обычно
- Ollama — это **дополнительная** проверка

### Производительность
- Первый запрос медленный (загрузка модели в RAM)
- Последующие запросы быстрые
- На M1/M2 Mac — очень быстро (GPU acceleration)

### Когда использовать
- **Ollama:** Для code review, поиска багов
- **Claude:** Для архитектуры, сложной логики
- **Вместе:** Двойная проверка критичного кода

---

## 🎉 Итого

**Рекомендую:**
1. Установи **Ollama**
2. Скачай **deepseek-coder:6.7b**
3. Запусти `ollama serve`
4. Я интегрирую в агенты (когда скажешь)

**Результат:**
- Бесплатная локальная AI
- Code review в 2x качественнее (Claude + Ollama)
- Работает офлайн
- Нет лимитов

**Хочешь, чтобы я создал файл `ollama-assistant.js` и интегрировал в агентов?**

---

**Версия:** 1.0
**Дата:** 1 октября 2025
**Статус:** 🟢 Ready to implement
