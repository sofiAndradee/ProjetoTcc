import "./style.css"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter , Route , Routes} from "react-router-dom";

import Login from './pages/Login/Login';
import Home  from './pages/Home/Home'
import Local  from './pages/Local/Local'
import Noticia from './pages/Noticia/Noticia'
import Historia from './pages/Historia/quem-somos'
import Cadastro from './pages/Cadastro/Cadastro'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>

    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Local' element={<Local/>}/>
      <Route path='/Noticia' element={<Noticia/>}/>
      <Route path='/Login' element={<Login/>}/>
      <Route path='/Historia' element={<Historia/>}/>
      <Route path="/Cadastro" element={<Cadastro />} />
    </Routes>
  
  </BrowserRouter>,
)
