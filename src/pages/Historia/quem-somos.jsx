import Navbar from "../../components/NavBar/Navbar";
import Footer from  "../../components/Footer/Footer"
import './AboutStyle.css'

function quemSomos() {

    return (

        <>


        <Navbar />

            <div className="container">

                     <h1>Nossa História</h1>

                
                    <div className="Sobre-Nos">
                        <div className="Sobre-Text">
                            <p>

                               O <strong>Comuna Esportes</strong> nasceu do desejo de mapear, conectar e fortalecer as iniciativas esportivas autônomas que acontecem diariamente
                            nas comunidades periféricas.
                            <br /><br />
                            Acreditamos que o acesso ao esporte e ao lazer é um direito fundamental capaz de transformar realidades coletivas, gerar saúde
                            preventiva e fomentar manifestações culturais vibrantes.

                        </p>
                        </div>

                    </div>
                


                <div className="Cotainer-card">
                    <div className="Item-container">
                        <h2>Saúde</h2>
                        <p>
                            Promover o bem-estar físico e mental através da prática regular de exercícios físicos acessíveis.
                        </p>

                    </div>

                    <div   className="Item-container">
                        <h2>União</h2>
                        <p>
                            Aproximar atletas amadores, organizadores de times e apoiadores locais em uma única rede integrada.
                        </p>

                    </div>

                    <div className="Item-container">
                        <h2>Cultura</h2>
                        <p>
                            Valorizar a identidade periférica mesclando esporte com música, dança e vivências de rua.
                        </p>


                    </div>
                    
                </div>

            </div>

        <Footer/>
        </>
    );


}

export default quemSomos; 