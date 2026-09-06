import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home  from './pages/Home/Home'
import Local  from './pages/Local/Local'
import { BrowserRouter , Route , Routes} from "react-router-dom";
import "./style.css"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Local' element={<Local/>}/>
      
    </Routes>
  
  </BrowserRouter>,
)
