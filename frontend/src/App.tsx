import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 3500,

          style: {
            minWidth: "320px",
            maxWidth: "420px",
            padding: "14px 18px",
            borderRadius: "14px",
            background: "#ffffff",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.06)",
            fontSize: "14px",
            fontWeight: 500,
          },

          success: {
            duration: 3500,
            style: {
              background: "#ffffff",
              color: "#166534",
              border: "1px solid #bbf7d0",
              boxShadow: "0 10px 30px rgba(22, 101, 52, 0.12)",
            },
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },

          error: {
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              boxShadow: "0 10px 30px rgba(185, 28, 28, 0.12)",
            },
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },

          loading: {
            style: {
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #e2e8f0",
            },
          },
        }}
      />

      <AppRoutes />
    </AuthProvider>
  );
}

export default App;