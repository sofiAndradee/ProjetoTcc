
import "./FooterStyle.css"


export default function Footer() {
    return (

        <footer>
            <div>
                <h4>Entre em contato</h4>
                <p>comunaesportes@gmail.com</p>
            </div>

            <div className="social">
                <a href="#" aria-label="Instagram">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.8"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="5"
                        />

                        <circle
                            cx="12"
                            cy="12"
                            r="4"
                        />

                        <circle
                            cx="17.5"
                            cy="6.5"
                            r="0.8"
                            fill="#fff"
                        />
                    </svg>
                </a>

                <a href="#" aria-label="E-mail">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.8"
                    >
                        <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                        />

                        <path d="M3 7l9 6 9-6" />
                    </svg>
                </a>
            </div>
        </footer>

    )

}