# DeepAuto Scaleserve AI ChatBot

## 🚀 실행 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/DA-Scaleserve-ChatBot.git
cd DA-Scaleserve-ChatBot

# 2. 백엔드 설정 및 실행
cd server
python -m venv venv
source venv/bin/activate
poetry install
alembic upgrade head
poetry run uvicorn main:app --reload --port 8081

# 3. 프론트엔드 설정 및 실행
cd ../nextjs
npm install
npm run dev
```
---
## 🧩 서버 종속성 목록 (FastAPI)
<details> 
<summary>📦 requirements.txt 주요 항목 보기</summary>
<ul>
<li>fastapi</li>

<li>uvicorn</li>

<li>sqlalchemy</li>

<li>aiosqlite</li>

<li>alembic</li>

<li>pydantic</li>

<li>sse-starlette</li>

<li>httpx</li>

</ul>
</details>

---

## 🧩 Next.js 종속성 목록
<details> <summary>📦 package.json 주요 항목 보기</summary>
<ul>
</ul>
<li>next</li>

<li>react</li>

<li>react-dom</li>

<li>react-markdown</li>

<li>tailwindcss</li>

<li>clsx</li>

<li>swr</li>

<li>typescript</li>

<li>eslint / prettier</li>

</details>

---

## 🏗 프로젝트 아키텍처 개요
```
├── ai-chat-app/
│
├── server/                 # FastAPI 기반 백엔드
│   ├── main.py             # 엔트리포인트
│   ├── alembic             # alembic DB 세팅
│   ├── db                  
│   │   ├── database.py     # DB 연결 설정 
│   │   ├── models.py       # DB Table 및 Column 구성
│   ├── migrations          # Alembic DB migration
│   ├── schemas
│   │   └── chat.py         # API Request에 사용되는 Payload 정의
│   ├── routes/             
│   │   ├── router.py         # 채팅 생성 / 수정 / 삭제, 메시지 저장 / 스트림 생성 API
│   └── ...
│
├── nextjs/                    # Next.js 기반 프론트엔드
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx                # 메인 챗봇 UI
│   │   ├── components/
│   │   │   ├── ChatBotWindow.tsx       # 챗봇
│   │   │   ├── ChatHistorySideBar.tsx  # 챗봇 대화 이력
│   │   │   ├── ChatInput.tsx           # 챗봇 채팅 입력창
│   │   │   └── ChatMessageBubble.tsx   # 챗봇 채팅 메시지 컴포넌트
│   │   └── types.d.ts                  # Parameter 타입 정의
│   └── ...
│
└── README.md
```

---
## 🧾 데이터베이스 ERD
```
┌───────────────┐
│     Chat      │
├───────────────┤
│ id            │ (PK)
│ title         │
│ created_at    │
└───────────────┘
        ▲
        │ 1:N
        ▼
┌───────────────┐
│   Message     │
├───────────────┤
│ id            │ (PK)
│ chat_id       │ (FK → Chat.id)
│ role          │ Enum('user' | 'assistant')
│ message       │
│ query_routing │
│ created_at    │
└───────────────┘
```