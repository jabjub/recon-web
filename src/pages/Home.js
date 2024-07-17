import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import io from "socket.io-client";

const Home = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [isValidIp, setIsValidIp] = useState(false);
  const [action, setAction] = useState("");
  const [socket, setSocket] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIpAddress(value);
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    setIsValidIp(ipRegex.test(value));
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();

    if (!isValidIp) {
      alert("Please enter a valid IP address!");
      return;
    }

    setIsScanning(true);
    setIsScanComplete(false);

    try {
      await axios.post("http://localhost:3002/api/startScan", { ipAddress });
    } catch (error) {
      console.error("Error starting scan:", error);
      alert("Failed to start scan. Please try again.");
      setIsScanning(false); // Revert to start scan if an error occurs
    }
  };

  const handleAction = (a) => {
    socket.emit("userInput", a);
  };

  useEffect(() => {
    const socket = io("http://localhost:3002");
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("confirmationNeeded", (data) => {
      const cleanData = data.replace(
        /[\u001b\u009b][[()#;?]*(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*)?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[a-zA-Z\d])/g,
        ""
      );

      const regex =
        /SemiAutoRecon wants to execute the following command:\s*([\s\S]*?)\s*Type\s*".*?"/;
      const match = cleanData.match(regex);

      if (match && match[1]) {
        setAction(match[1].trim());
        setIsScanning(true); // Keep it scanning until all commands are processed
      }
    });

    socket.on("scanComplete", () => {
      setIsScanComplete(true);
      setIsScanning(false); // Only set to false when scan is completely done
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="input-container">
        <form onSubmit={handleScanSubmit}>
          <label className="input-label">Enter IP Address:</label>
          <input
            type="text"
            value={ipAddress}
            onChange={handleInputChange}
            placeholder="Enter IP address..."
            className="input-field"
          />
          <button
            type="submit"
            className={`submit-button ${
              isScanning ? "scanning" : isValidIp ? "valid" : "invalid"
            }`}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Start Scan"}
          </button>
        </form>
      </div>
      {action && (
        <div className="confirmation-container">
          <div className="confirmation-message">
            Command to execute:
            <div className="command-text">{action}</div>
          </div>
          <div className="confirmation-buttons">
            <button
              className="confirm-button accept"
              onClick={() => handleAction("y")}
            >
              Accept
            </button>
            <button
              className="confirm-button refuse"
              onClick={() => handleAction("n")}
            >
              Refuse
            </button>
          </div>
        </div>
      )}
      {isScanComplete && (
        <div className="scan-complete">
          <p>Scan complete. All commands processed.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
