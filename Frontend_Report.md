# SkyGPT Frontend Report (Hinglish)

Yeh report SkyGPT project ke **Frontend** (React + Vite) ke har ek term, technology, hooks, aur tools ko simple Hinglish me explain karti hai. Har ek topic me **What, Why, How, Alternatives, Working, Syntax (with File Path), aur Analogy** cover kiya gaya hai.

---

## Index of Topics Covered
1. **React** (UI Library)
2. **Vite** (Build Tool & Dev Server)
3. **React Router DOM** (Routing System)
4. **React Context API (MyContext & AuthContext)** (State Management)
5. **React Hooks** (`useState`, `useEffect`, `useContext`)
6. **React Markdown** (`react-markdown` + `rehype-highlight` + `highlight.js`)
7. **Fetch API with Credentials** (CORS Cookie Sharing)
8. **React Spinners (ScaleLoader)** (Loading Indicator)

---

## 1. React
* **What**: React ek Javascript library hai jo Facebook/Meta ne banayi hai. Yeh dynamic aur interactive User Interfaces (UI) banane ke kaam aati hai.
* **Why**: Hum ise isliye use kar rahe hain taaki pure page ko reload kiye bina hum chat application me real-time updates (messages show karna, loaders chalana) de sakein. Yeh ek Single Page Application (SPA) banata hai.
* **How & File Path**: pure frontend codebase me use hua hai (e.g., [App.jsx](file:///e:/SkyGPT_old/Frontend/src/App.jsx)).
* **Syntax**:
  ```jsx
  // Frontend/src/App.jsx
  import React from "react";
  
  function App() {
    return <div>Hello SkyGPT</div>;
  }
  ```
* **Alternate**: Vue.js, Angular, Svelte, or Vanilla JavaScript.
* **Working**: React **Virtual DOM** concept ka use karta hai. Jab bhi state change hoti hai, React background me Virtual DOM me changes compare karta hai (diffing algorithm) aur sirf usi part ko real DOM me update karta hai jahan change hua hai, na ki poore page ko.
* **Analogy**: Socho aap ek restaurant me hain jahan menu card digital board par dikhaya jaata hai. Agar chef koi naya item add kare, toh poore board ko phenk kar naya lagane ke bajaye sirf us ek specific text line ko badal diya jaata hai. React bhi aise hi screen par keval badle hue parts ko update karta hai.

---

## 2. Vite
* **What**: Vite (French word, jiska matlab hai "Fast") ek modern frontend build tool aur development server hai.
* **Why**: Purane tools jaise Webpack bohot slow local development servers chalate the. Vite Instant Server Start aur Lightning-fast Hot Module Replacement (HMR) provide karta hai, jisse developers ka code turant screen par render hota hai.
* **How & File Path**: Iska configuration [vite.config.js](file:///e:/SkyGPT_old/Frontend/vite.config.js) me hota hai, aur run karne ke liye [package.json](file:///e:/SkyGPT_old/Frontend/package.json) ke commands use hote hain.
* **Syntax**:
  ```javascript
  // Frontend/vite.config.js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
  })
  ```
* **Alternate**: Webpack, Parcel, Turbopack, Snowpack.
* **Working**: Vite modern browser ke **Native ES Modules (ESM)** ka use karta hai. Yeh files ko compile karne ke bajaye directly request par import karta hai, aur dependency bundling ke liye 'esbuild' use karta hai jo Go language me likha hai aur bohot fast hai.
* **Analogy**: Webpack ek aisi post office process thi jahan pehle poore shehar ke saare letters ko ek sath bundle kiya jata tha aur fir delivery shuru hoti thi (slow start). Vite ek aisi dynamic bike courier service hai jo jaise hi aap kisi letter (file) ko mangte ho, use lekar seedhe browser tak pahuncha deti hai instantly.

---

## 3. React Router DOM
* **What**: React Router DOM ek package hai jo React web apps me navigation aur multi-page routing manage karne ke kaam aata hai.
* **Why**: Kyunki React ek Single Page Application (SPA) hai, physical HTML files nahi hoti. Hame alag-alag components (Login, Signup, Chat, Forgot Password) ko alag-alag URLs (jaise `/login`, `/signup`, `/`) par render karne ke liye routing ki zarurat hoti hai.
* **How & File Path**: [App.jsx](file:///e:/SkyGPT_old/Frontend/src/App.jsx) me routes set kiye gaye hain.
* **Syntax**:
  ```jsx
  // Frontend/src/App.jsx
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  
  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainChatApp /></ProtectedRoute>} />
        </Routes>
      </Router>
    );
  }
  ```
* **Alternate**: Next.js builtin router, TanStack Router.
* **Working**: Yeh browser ke History API ko intercept karta hai. Jab url change hota hai (jaise `/login`), browser ko server se fresh request mangne se rokta hai aur React ke virtual tree me matches dhundh kar specific component ko load kar deta hai.
* **Analogy**: Socho ek museum me bohot saare rooms hain. Agar aap 'Roman History' room me jana chahte hain, toh aapko museum se bahar nikal kar dobara enter karne ki zarurat nahi hai; wahan par ek guide (Router) hai jo aapko direct us room ke door (Route) par khada kar deta hai.

---

## 4. React Context API (MyContext & AuthContext)
* **What**: Context API React ka ek build-in feature hai jo state ko global level par manage karne aur data ko drill-down (prop-drilling) kiye bina components me pass karne ke kaam aata hai.
* **Why**: SkyGPT me prompt, reply, current thread, aur user authentication status ko sidebar, chat window aur profile drop-down, sabhi jagah access karna padta hai. Context API ke bina hame in values ko har component ke through manually pass karna padta (Prop Drilling), jo messy ho jata.
* **How & File Path**: [MyContext.jsx](file:///e:/SkyGPT_old/Frontend/src/MyContext.jsx) (for chat features) aur [AuthProvider.jsx](file:///e:/SkyGPT_old/Frontend/src/auth/AuthProvider.jsx) (for authentication user state).
* **Syntax**:
  ```jsx
  // Frontend/src/MyContext.jsx
  import { createContext } from "react";
  export const MyContext = createContext(null);

  // Frontend/src/App.jsx (Providing the values)
  <MyContext.Provider value={providerValues}>
      <Sidebar />
      <ChatWindow />
  </MyContext.Provider>
  ```
* **Alternate**: Redux Toolkit, Zustand, Recoil.
* **Working**: React context ek **Provider** component deta hai jisme hum global values daalte hain. Jo bhi child component inside this provider wrapped hota hai, woh `useContext(MyContext)` hook se direct in values ko subscribe aur use kar sakta hai. Jab value update hoti hai, sabhi subscribed components re-render ho jaate hain.
* **Analogy**: Ek ghar me agar water tank (Context Provider) chat par laga diya jaye, toh har room (child component) me direct pipe connection se pani mil jata hai. Kisi ko baltiyan lekar seedhiyon se upar-neeche (Prop Drilling) karne ki zarurat nahi hoti.

---

## 5. React Hooks (`useState`, `useEffect`, `useContext`)
* **What**: Hooks React 16.8 me laye gaye special functions hain jo functional components ko state management aur lifecycle events handling ka features dete hain.
  * **useState**: Local variable store aur change karne ke liye.
  * **useEffect**: Side-effects jaise API call ya data fetching, cleanup functions implement karne ke liye.
  * **useContext**: Kisi Context Provider se directly value read karne ke liye.
* **Why**: State dynamics aur functional program structures ke bina modern functional React components build nahi kiye ja sakte.
* **How & File Paths**: 
  * `useState` aur `useContext` use hote hain: [ChatWindow.jsx](file:///e:/SkyGPT_old/Frontend/src/ChatWindow.jsx), [Sidebar.jsx](file:///e:/SkyGPT_old/Frontend/src/Sidebar.jsx).
  * `useEffect` ka use hota hai: [Chat.jsx](file:///e:/SkyGPT_old/Frontend/src/Chat.jsx) typewriter animation ke liye.
* **Syntax**:
  ```jsx
  // Frontend/src/ChatWindow.jsx
  const [loading, setLoading] = useState(false); // useState
  
  useEffect(() => {
     // Fetch data on component mount
     getAllThreads(); 
  }, [currThreadId]); // useEffect (runs when currThreadId changes)
  
  const { prompt } = useContext(MyContext); // useContext
  ```
* **Alternate**: Class components ke constructor aur lifecycle methods (`componentDidMount`, `componentDidUpdate`), par modern React me ab Hooks industry standard hain.
* **Working**:
  * **useState** component render cycle ke beech variable ki value save rakhta hai aur jab state updater (like `setLoading`) call hota hai toh render logic dobara trigger karta hai.
  * **useEffect** render process complete hone ke baad run hota hai aur iska dependency array define karta hai ki ise kab dobara run hona hai.
  * **useContext** direct context node pointer se lookup karke dynamic data read karta hai.
* **Analogy**: 
  * `useState` jaise ek student ki rough notebook ka page jahan woh numbers note karta aur badalta rehta hai.
  * `useEffect` ek smart alarm clock ki tarah hai, jo tabhi baje jab koi specific din (dependency update) aaye.
  * `useContext` jaise direct wireless wifi connection se net chalana.

---

## 6. React Markdown (`react-markdown` + `rehype-highlight` + `highlight.js`)
* **What**: React Markdown ek React component hai jo markdown text ko safely HTML elements me parse aur render karta hai, jabki `rehype-highlight` code blocks ko auto-detect karke style templates apply karta hai using CSS themes.
* **Why**: Gemini API se aane wala assistant response pure markdown me hota hai (jaise backticks for code, hash `#` for headings). Un formatted responses ko normal text me dikhane ke bajaye beautifully standard output formatting, bullet list, aur syntax-highlighted blocks me convert karne ke liye inka use kiya gaya hai.
* **How & File Path**: [Chat.jsx](file:///e:/SkyGPT_old/Frontend/src/Chat.jsx) me messages render karte samay wrap kiya gaya hai.
* **Syntax**:
  ```jsx
  // Frontend/src/Chat.jsx
  import ReactMarkdown from "react-markdown";
  import rehypeHighlight from "rehype-highlight";
  import "highlight.js/styles/github-dark.css";

  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
  ```
* **Alternate**: `marked`, `dangerouslySetInnerHTML` with `DOMPurify`.
* **Working**: React Markdown internally string ko parse karta hai aur React Virtual DOM Elements map karta hai. `rehype-highlight` HTML tree nodes ko analyze karta hai aur syntax classifications (jaise keywords, variables, comments) ke tags inject karta hai, jo `github-dark.css` sheet se match hokar styles and highlights dikhate hain.
* **Analogy**: Ek chef ka dynamic recipe instruction book raw format me hai, aur ek reader use padh raha hai. React Markdown ek translation book hai jo us shorthand recipe ko visually decorated photos, bold titles aur step-by-step boxes me transform karke reader ko dikhati hai.

---

## 7. Fetch API with Credentials
* **What**: Fetch API JavaScript ka in-built asynchronous web request maker tool hai. Isme hum config key `{ credentials: "include" }` apply karte hain.
* **Why**: Jab backend aur frontend alag origins (CORS domains, e.g., localhost:5173 aur localhost:8080) par host hote hain, tab browsers by default cross-origin requests par cookies (session tokens) store aur pass nahi karte. `{ credentials: "include" }` setting browser ko force karti hai ki woh request headers ke saath authentication cookies ko securely bheje aur accept kare.
* **How & File Path**: [authApi.js](file:///e:/SkyGPT_old/Frontend/src/services/authApi.js) aur pure file requests me parameters ke sath define kiya gaya hai.
* **Syntax**:
  ```javascript
  // Frontend/src/services/authApi.js
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Very important for Session Cookies
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  ```
* **Alternate**: Axios (`axios.create({ withCredentials: true })`).
* **Working**: Browser requests prepare karte samay check karta hai ki destination URL request authorization settings me `credentials: "include"` set hai ya nahi. Agar set hai toh local cookies storage se correct scope token fetch karke headers me cookie pack karke request dispatch kar deta hai.
* **Analogy**: Socho aap ek private club ke door par security checking me ja rahe ho. Normal ticket (fetch request) door validation pass nahi karegi jab tak aap custom VIP RFID card scanner (credentials include) device par tap na kar do. Scanner check karega aur aapko andoor jaane dega.

---

## 8. React Spinners (ScaleLoader)
* **What**: `react-spinners` ek react icon loaders library hai jisme se `ScaleLoader` import kiya gaya hai. Yeh vertical moving bar format me loaders draw karta hai.
* **Why**: Jab user input prompt daal kar send button dabata hai, Gemini server logic answer compile karne me kuch seconds leta hai. Is duration me user screen blank ya freeze na dikhe aur unhe dynamic load indicator dikhe, isliye is loading status bar ko implement kiya gaya hai.
* **How & File Path**: [ChatWindow.jsx](file:///e:/SkyGPT_old/Frontend/src/ChatWindow.jsx) me state checks ke sath setup hai.
* **Syntax**:
  ```jsx
  // Frontend/src/ChatWindow.jsx
  import { ScaleLoader } from "react-spinners";
  
  <ScaleLoader color="#fff" loading={loading} />
  ```
* **Alternate**: Lottie animations, customized CSS loading animations, standard SVG indicators.
* **Working**: `loading` boolean state variables (controlled inside `getReply` call) par switch toggle karta hai. Jab logic start hota hai toh dynamic indicator active ho jata hai, aur response success aane par status false karke is animation loader component ko tree se remove kar deta hai.
* **Analogy**: Jab aap kisi lift me enter karke button press karte hain, toh elevator screen par arrow status update bars up-down hone lagte hain taaki aapko pata chale lift progress me chal rahi hai aur system hang nahi hua hai.
