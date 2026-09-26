import { ImageResponse } from "next/og";

// Image de partage (réseaux sociaux, WhatsApp, aperçus de liens) générée à la
// volée — on n'a pas de visuel de marque dédié, donc on recompose ici la
// même identité que l'app (fond teal, wordmark blanc) plutôt que de laisser
// les plateformes sociales afficher un aperçu vide ou une capture d'écran.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#146356",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 32,
            background: "#ffffff",
            marginBottom: 40,
            fontSize: 76,
            fontWeight: 800,
            color: "#146356",
          }}
        >
          TT
        </div>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          TROUVE TOUT
        </div>
        <div
          style={{
            display: "flex",
            color: "#d7ece7",
            fontSize: 34,
            marginTop: 22,
            fontWeight: 500,
          }}
        >
          Achetez, vendez, louez — en toute confiance
        </div>
      </div>
    ),
    { ...size }
  );
}
