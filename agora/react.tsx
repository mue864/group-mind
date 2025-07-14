// CORE-SDK
import AgoraUIKit from "agora-rn-uikit";

const App = () => {
  const connectionData = {
    appId: "e7f6e9aeecf14b2ba10e3f40be9f56e7",
    channel: "test",
    token: null, // enter your channel token as a string
  };
  return <AgoraUIKit connectionData={connectionData} />;
};

export default App;

// appid: 6789f301a9b14fbd855543bc208187b3
