import "./NoticiaStyle.css";
import CardEvento from "../../components/CardEvento/CardEvento";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/NavBar/Navbar";
import PesquisaFiltro from "../../components/Filtro/Filtro";
import { useState } from "react";




export default function Noticia() {
    return (
        <>
        <Navbar></Navbar>
        <main>
            <PesquisaFiltro></PesquisaFiltro>
            <div className="noticia">

                <h2>Noticias</h2>
                
                <CardEvento></CardEvento>
            
            </div>
        </main>
        <Footer></Footer>
        </>

    );


}

