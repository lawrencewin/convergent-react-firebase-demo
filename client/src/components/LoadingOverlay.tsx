import { ClipLoader } from "react-spinners"

export function LoadingOverlay({ message }: { message: string }) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 10000,
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <div>
                <ClipLoader color="#109fe0" size={70} />
                <h5 style={{ color: "#fff" }}>{message}...</h5>
            </div>
        </div>
    )
}
