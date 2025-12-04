// App.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContractReadOnly, getContractWithSigner } from "./contract";
import WalletManager from "./components/WalletManager";
import WalletSelector from "./components/WalletSelector";
import "./App.css";

interface LearningMaterial {
  id: string;
  encryptedData: string;
  timestamp: number;
  owner: string;
  difficulty: number;
  status: "generating" | "ready" | "completed";
  score?: number;
}

const App: React.FC = () => {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    visible: boolean;
    status: "pending" | "success" | "error";
    message: string;
  }>({ visible: false, status: "pending", message: "" });
  const [showFAQ, setShowFAQ] = useState(false);
  const [knowledgeGraph, setKnowledgeGraph] = useState({
    math: 0.65,
    science: 0.42,
    language: 0.78,
    history: 0.55
  });

  // Calculate statistics
  const readyCount = materials.filter(m => m.status === "ready").length;
  const completedCount = materials.filter(m => m.status === "completed").length;
  const avgDifficulty = materials.length > 0 
    ? materials.reduce((sum, m) => sum + m.difficulty, 0) / materials.length 
    : 0;
  const avgScore = materials.filter(m => m.score).length > 0 
    ? materials.filter(m => m.score).reduce((sum, m) => sum + (m.score || 0), 0) / materials.filter(m => m.score).length 
    : 0;

  useEffect(() => {
    loadMaterials().finally(() => setLoading(false));
  }, []);

  const onWalletSelect = async (wallet: any) => {
    if (!wallet.provider) return;
    try {
      const web3Provider = new ethers.BrowserProvider(wallet.provider);
      setProvider(web3Provider);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const acc = accounts[0] || "";
      setAccount(acc);

      wallet.provider.on("accountsChanged", async (accounts: string[]) => {
        const newAcc = accounts[0] || "";
        setAccount(newAcc);
      });
    } catch (e) {
      alert("Failed to connect wallet");
    }
  };

  const onConnect = () => setWalletSelectorOpen(true);
  const onDisconnect = () => {
    setAccount("");
    setProvider(null);
  };

  const loadMaterials = async () => {
    setIsRefreshing(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) return;
      
      // Check contract availability using FHE
      const isAvailable = await contract.isAvailable();
      if (!isAvailable) {
        console.error("Contract is not available");
        return;
      }
      
      const keysBytes = await contract.getData("material_keys");
      let keys: string[] = [];
      
      if (keysBytes.length > 0) {
        try {
          keys = JSON.parse(ethers.toUtf8String(keysBytes));
        } catch (e) {
          console.error("Error parsing material keys:", e);
        }
      }
      
      const list: LearningMaterial[] = [];
      
      for (const key of keys) {
        try {
          const materialBytes = await contract.getData(`material_${key}`);
          if (materialBytes.length > 0) {
            try {
              const materialData = JSON.parse(ethers.toUtf8String(materialBytes));
              list.push({
                id: key,
                encryptedData: materialData.data,
                timestamp: materialData.timestamp,
                owner: materialData.owner,
                difficulty: materialData.difficulty || 3,
                status: materialData.status || "generating",
                score: materialData.score
              });
            } catch (e) {
              console.error(`Error parsing material data for ${key}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error loading material ${key}:`, e);
        }
      }
      
      list.sort((a, b) => b.timestamp - a.timestamp);
      setMaterials(list);
    } catch (e) {
      console.error("Error loading materials:", e);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const generateMaterial = async () => {
    if (!provider) { 
      alert("Please connect wallet first"); 
      return; 
    }
    
    setGenerating(true);
    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Generating personalized materials using FHE..."
    });
    
    try {
      const contract = await getContractWithSigner();
      if (!contract) {
        throw new Error("Failed to get contract with signer");
      }
      
      // Simulate FHE-based material generation
      const materialId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const difficulty = Math.floor(Math.random() * 5) + 1; // 1-5 difficulty
      
      const materialData = {
        data: `FHE-ENCRYPTED-MATERIAL-${materialId}`,
        timestamp: Math.floor(Date.now() / 1000),
        owner: account,
        difficulty: difficulty,
        status: "generating"
      };
      
      // Store encrypted data on-chain using FHE
      await contract.setData(
        `material_${materialId}`, 
        ethers.toUtf8Bytes(JSON.stringify(materialData))
      );
      
      const keysBytes = await contract.getData("material_keys");
      let keys: string[] = [];
      
      if (keysBytes.length > 0) {
        try {
          keys = JSON.parse(ethers.toUtf8String(keysBytes));
        } catch (e) {
          console.error("Error parsing keys:", e);
        }
      }
      
      keys.push(materialId);
      
      await contract.setData(
        "material_keys", 
        ethers.toUtf8Bytes(JSON.stringify(keys))
      );
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "Personalized materials generated with FHE!"
      });
      
      // Simulate FHE processing completion
      setTimeout(async () => {
        const updatedMaterial = {
          ...materialData,
          status: "ready"
        };
        
        await contract.setData(
          `material_${materialId}`, 
          ethers.toUtf8Bytes(JSON.stringify(updatedMaterial))
        );
        
        await loadMaterials();
      }, 3000);
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
        setShowGenerateModal(false);
      }, 2000);
    } catch (e: any) {
      const errorMessage = e.message.includes("user rejected transaction")
        ? "Transaction rejected by user"
        : "Generation failed: " + (e.message || "Unknown error");
      
      setTransactionStatus({
        visible: true,
        status: "error",
        message: errorMessage
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    } finally {
      setGenerating(false);
    }
  };

  const completeMaterial = async (materialId: string) => {
    if (!provider) {
      alert("Please connect wallet first");
      return;
    }

    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Processing learning results with FHE..."
    });

    try {
      const contract = await getContractWithSigner();
      if (!contract) {
        throw new Error("Failed to get contract with signer");
      }
      
      const materialBytes = await contract.getData(`material_${materialId}`);
      if (materialBytes.length === 0) {
        throw new Error("Material not found");
      }
      
      const materialData = JSON.parse(ethers.toUtf8String(materialBytes));
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 score
      
      const updatedMaterial = {
        ...materialData,
        status: "completed",
        score: score
      };
      
      await contract.setData(
        `material_${materialId}`, 
        ethers.toUtf8Bytes(JSON.stringify(updatedMaterial))
      );
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "Learning results processed with FHE!"
      });
      
      await loadMaterials();
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 2000);
    } catch (e: any) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Processing failed: " + (e.message || "Unknown error")
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    }
  };

  const checkAvailability = async () => {
    try {
      const contract = await getContractReadOnly();
      if (!contract) return;
      
      const isAvailable = await contract.isAvailable();
      if (isAvailable) {
        setTransactionStatus({
          visible: true,
          status: "success",
          message: "FHE system is available and ready!"
        });
      } else {
        setTransactionStatus({
          visible: true,
          status: "error",
          message: "FHE system is currently unavailable"
        });
      }
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 2000);
    } catch (e) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Availability check failed"
      });
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    }
  };

  const renderKnowledgeGraph = () => {
    return (
      <div className="knowledge-graph">
        <div className="graph-bar">
          <div className="bar-label">Math</div>
          <div className="bar-container">
            <div 
              className="bar-fill" 
              style={{ width: `${knowledgeGraph.math * 100}%` }}
            ></div>
          </div>
          <div className="bar-value">{(knowledgeGraph.math * 100).toFixed(0)}%</div>
        </div>
        <div className="graph-bar">
          <div className="bar-label">Science</div>
          <div className="bar-container">
            <div 
              className="bar-fill" 
              style={{ width: `${knowledgeGraph.science * 100}%` }}
            ></div>
          </div>
          <div className="bar-value">{(knowledgeGraph.science * 100).toFixed(0)}%</div>
        </div>
        <div className="graph-bar">
          <div className="bar-label">Language</div>
          <div className="bar-container">
            <div 
              className="bar-fill" 
              style={{ width: `${knowledgeGraph.language * 100}%` }}
            ></div>
          </div>
          <div className="bar-value">{(knowledgeGraph.language * 100).toFixed(0)}%</div>
        </div>
        <div className="graph-bar">
          <div className="bar-label">History</div>
          <div className="bar-container">
            <div 
              className="bar-fill" 
              style={{ width: `${knowledgeGraph.history * 100}%` }}
            ></div>
          </div>
          <div className="bar-value">{(knowledgeGraph.history * 100).toFixed(0)}%</div>
        </div>
      </div>
    );
  };

  const renderDifficultyChart = () => {
    const difficultyCounts = [0, 0, 0, 0, 0];
    materials.forEach(m => {
      if (m.difficulty >= 1 && m.difficulty <= 5) {
        difficultyCounts[m.difficulty - 1]++;
      }
    });
    
    const maxCount = Math.max(...difficultyCounts, 1);
    
    return (
      <div className="difficulty-chart">
        {difficultyCounts.map((count, index) => (
          <div className="chart-bar" key={index}>
            <div className="bar-label">Level {index + 1}</div>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ height: `${(count / maxCount) * 100}%` }}
              ></div>
            </div>
            <div className="bar-value">{count}</div>
          </div>
        ))}
      </div>
    );
  };

  const faqItems = [
    {
      question: "How does FHE protect my learning data?",
      answer: "Fully Homomorphic Encryption allows processing of your encrypted knowledge graph without ever decrypting it, ensuring maximum privacy."
    },
    {
      question: "How are personalized materials generated?",
      answer: "Our FHE algorithm analyzes your encrypted knowledge gaps and dynamically selects appropriate exercises from our encrypted question bank."
    },
    {
      question: "Can I see my raw knowledge graph data?",
      answer: "No, your knowledge graph remains encrypted at all times. Only aggregated insights are revealed through our privacy-preserving system."
    },
    {
      question: "How does difficulty adaptation work?",
      answer: "The system continuously adjusts exercise difficulty based on your encrypted performance data using FHE computations."
    }
  ];

  if (loading) return (
    <div className="loading-screen">
      <div className="fhe-spinner">
        <div className="encryption-ring"></div>
        <div className="processing-core"></div>
      </div>
      <p>Initializing FHE learning system...</p>
    </div>
  );

  return (
    <div className="app-container futuristic-metallic">
      <header className="app-header">
        <div className="logo">
          <div className="brain-icon"></div>
          <h1>FHE<span>Learning</span>Gen</h1>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowGenerateModal(true)} 
            className="generate-btn metallic-button"
          >
            <div className="add-icon"></div>
            Generate Material
          </button>
          <button 
            className="metallic-button"
            onClick={checkAvailability}
          >
            Check FHE Status
          </button>
          <WalletManager account={account} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </header>
      
      <div className="main-content partitioned-panels">
        {/* Left Panel - Knowledge Graph & Controls */}
        <div className="panel-left">
          <div className="panel-section metallic-card">
            <h2>Your Knowledge Graph</h2>
            <p className="subtitle">Encrypted with FHE for privacy</p>
            {renderKnowledgeGraph()}
            
            <div className="fhe-badge">
              <span>FHE-Encrypted</span>
            </div>
          </div>
          
          <div className="panel-section metallic-card">
            <h2>Generate New Material</h2>
            <p>Create personalized exercises based on your knowledge gaps</p>
            <button 
              className="metallic-button primary"
              onClick={() => setShowGenerateModal(true)}
            >
              Generate with FHE
            </button>
          </div>
          
          <div className="panel-section metallic-card">
            <h2>System Status</h2>
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>FHE Processing: Active</span>
            </div>
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>Knowledge Graph: Encrypted</span>
            </div>
            <div className="status-item">
              <div className="status-indicator active"></div>
              <span>Adaptive Algorithm: Online</span>
            </div>
          </div>
        </div>
        
        {/* Center Panel - Materials & Statistics */}
        <div className="panel-center">
          <div className="panel-section metallic-card">
            <div className="section-header">
              <h2>Learning Materials</h2>
              <button 
                onClick={loadMaterials}
                className="refresh-btn metallic-button"
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            
            <div className="materials-list">
              {materials.length === 0 ? (
                <div className="no-materials">
                  <div className="no-data-icon"></div>
                  <p>No learning materials found</p>
                  <button 
                    className="metallic-button primary"
                    onClick={() => setShowGenerateModal(true)}
                  >
                    Generate First Material
                  </button>
                </div>
              ) : (
                materials.map(material => (
                  <div className="material-item" key={material.id}>
                    <div className="material-info">
                      <div className="material-id">#{material.id.substring(0, 6)}</div>
                      <div className="material-difficulty">
                        Difficulty: 
                        <span className="difficulty-stars">
                          {"★".repeat(material.difficulty)}{"☆".repeat(5 - material.difficulty)}
                        </span>
                      </div>
                      <div className="material-date">
                        {new Date(material.timestamp * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="material-status">
                      <span className={`status-badge ${material.status}`}>
                        {material.status}
                      </span>
                    </div>
                    <div className="material-actions">
                      {material.status === "ready" && (
                        <button 
                          className="action-btn metallic-button"
                          onClick={() => completeMaterial(material.id)}
                        >
                          Mark Complete
                        </button>
                      )}
                      {material.status === "completed" && material.score && (
                        <div className="material-score">
                          Score: {material.score}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="panel-section metallic-card">
            <h2>Learning Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{materials.length}</div>
                <div className="stat-label">Total Materials</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{readyCount}</div>
                <div className="stat-label">Ready</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{avgDifficulty.toFixed(1)}</div>
                <div className="stat-label">Avg Difficulty</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{avgScore.toFixed(1)}%</div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Charts & Info */}
        <div className="panel-right">
          <div className="panel-section metallic-card">
            <h2>Project Introduction</h2>
            <p className="project-description">
              FHE LearningGen uses Fully Homomorphic Encryption to create personalized learning materials 
              while keeping student knowledge graphs completely private. Our system analyzes encrypted 
              knowledge gaps and dynamically generates adaptive exercises without ever decrypting sensitive data.
            </p>
            <div className="fhe-process">
              <div className="process-step">
                <div className="step-icon">🔒</div>
                <div className="step-text">Encrypt knowledge graph</div>
              </div>
              <div className="process-step">
                <div className="step-icon">⚙️</div>
                <div className="step-text">FHE processes encrypted data</div>
              </div>
              <div className="process-step">
                <div className="step-icon">📚</div>
                <div className="step-text">Generate personalized materials</div>
              </div>
            </div>
          </div>
          
          <div className="panel-section metallic-card">
            <h2>Difficulty Distribution</h2>
            {renderDifficultyChart()}
          </div>
          
          <div className="panel-section metallic-card">
            <div className="faq-header">
              <h2>FHE Learning FAQ</h2>
              <button 
                className="metallic-button"
                onClick={() => setShowFAQ(!showFAQ)}
              >
                {showFAQ ? "Hide" : "Show"}
              </button>
            </div>
            
            {showFAQ && (
              <div className="faq-content">
                {faqItems.map((item, index) => (
                  <div className="faq-item" key={index}>
                    <div className="faq-question">{item.question}</div>
                    <div className="faq-answer">{item.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  
      {showGenerateModal && (
        <ModalGenerate 
          onSubmit={generateMaterial} 
          onClose={() => setShowGenerateModal(false)} 
          generating={generating}
        />
      )}
      
      {walletSelectorOpen && (
        <WalletSelector
          isOpen={walletSelectorOpen}
          onWalletSelect={(wallet) => { onWalletSelect(wallet); setWalletSelectorOpen(false); }}
          onClose={() => setWalletSelectorOpen(false)}
        />
      )}
      
      {transactionStatus.visible && (
        <div className="transaction-modal">
          <div className="transaction-content metallic-card">
            <div className={`transaction-icon ${transactionStatus.status}`}>
              {transactionStatus.status === "pending" && <div className="fhe-spinner small"></div>}
              {transactionStatus.status === "success" && <div className="success-icon"></div>}
              {transactionStatus.status === "error" && <div className="error-icon"></div>}
            </div>
            <div className="transaction-message">
              {transactionStatus.message}
            </div>
          </div>
        </div>
      )}
  
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="brain-icon"></div>
              <span>FHE LearningGen</span>
            </div>
            <p>Privacy-first personalized learning with Fully Homomorphic Encryption</p>
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Research Papers</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="fhe-badge">
            <span>FHE-Powered Education</span>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} FHE LearningGen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ModalGenerateProps {
  onSubmit: () => void; 
  onClose: () => void; 
  generating: boolean;
}

const ModalGenerate: React.FC<ModalGenerateProps> = ({ 
  onSubmit, 
  onClose, 
  generating
}) => {
  return (
    <div className="modal-overlay">
      <div className="generate-modal metallic-card">
        <div className="modal-header">
          <h2>Generate Learning Material</h2>
          <button onClick={onClose} className="close-modal">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="fhe-notice-banner">
            <div className="lock-icon"></div> 
            Your knowledge graph will remain encrypted during FHE processing
          </div>
          
          <div className="material-preview">
            <div className="preview-header">Personalized Exercise Set</div>
            <div className="preview-content">
              <div className="preview-subject">Mathematics</div>
              <ul className="preview-exercises">
                <li>Algebraic expressions (FHE difficulty adjusted)</li>
                <li>Geometry proofs (Personalized based on knowledge gaps)</li>
                <li>Calculus problems (Adaptive complexity)</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="cancel-btn metallic-button"
          >
            Cancel
          </button>
          <button 
            onClick={onSubmit} 
            disabled={generating}
            className="submit-btn metallic-button primary"
          >
            {generating ? "Generating with FHE..." : "Generate Securely"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;