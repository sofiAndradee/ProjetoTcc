import "./style.css"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter , Route , Routes} from "react-router-dom";


import Home  from './pages/Home/Home'
import Local  from './pages/Local/Local'
import Noticia from "./pages/Noticia/Noticia"



createRoot(document.getElementById('root')).render(
  <BrowserRouter>

    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Local' element={<Local/>}/>
      <Route path='/Noticia' element={<Noticia/>}/>
    </Routes>
  
  </BrowserRouter>,
)
