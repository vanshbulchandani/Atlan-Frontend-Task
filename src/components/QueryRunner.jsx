import React, { useState } from "react";
import AceEditor from "react-ace";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-dracula";
import "./QueryRunner.css";

const PREDEFINED_QUERIES = [
  {
    title: "Select All Customers",
    description: "Retrieve all customer records with their contact information",
    query: "SELECT * FROM customers;",
  },
  {
    title: "Top Products by Revenue",
    description: "Find the top-selling products by total revenue",
    query:
      "SELECT p.name, SUM(oi.quantity * oi.price) as revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nGROUP BY p.id, p.name\nORDER BY revenue DESC\nLIMIT 10;",
  },
  {
    title: "Monthly Sales Analysis",
    description: "Analyze sales performance by month for the current year",
    query:
      "SELECT DATE_TRUNC('month', order_date) as month,\nCOUNT(*) as total_orders,\nSUM(total_amount) as revenue\nFROM orders\nWHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)\nGROUP BY month\nORDER BY month;",
  },
  {
    title: "Customer Order History",
    description: "View detailed order history for a specific customer",
    query:
      "SELECT\n  o.order_id,\n  o.order_date,\n  o.total_amount,\n  o.status,\n  COUNT(oi.item_id) as total_items\nFROM orders o\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.customer_id = 42\nGROUP BY o.order_id, o.order_date, o.total_amount, o.status\nORDER BY o.order_date DESC;",
  },
  {
    title: "Inventory Status Report",
    description: "Check current inventory levels and restock status",
    query:
      "SELECT\n  p.name,\n  p.sku,\n  p.current_stock,\n  p.reorder_point,\n  CASE WHEN p.current_stock <= p.reorder_point THEN 'Restock needed' ELSE 'OK' END as status\nFROM products p\nWHERE p.current_stock <= p.reorder_point;",
  },
];

const MOCK_RESULTS = {
  "Customer Order History": {
    columns: [
      "order_id",
      "order_date",
      "total_amount",
      "status",
      "total_items",
    ],
    rows: [
      {
        order_id: 1089,
        order_date: "2023-11-15",
        total_amount: 325.5,
        status: "Delivered",
        total_items: 3,
      },
      {
        order_id: 956,
        order_date: "2023-09-22",
        total_amount: 189.95,
        status: "Delivered",
        total_items: 2,
      },
      {
        order_id: 842,
        order_date: "2023-07-10",
        total_amount: 450.25,
        status: "Delivered",
        total_items: 4,
      },
      {
        order_id: 731,
        order_date: "2023-05-03",
        total_amount: 275.0,
        status: "Delivered",
        total_items: 3,
      },
      {
        order_id: 625,
        order_date: "2023-03-18",
        total_amount: 125.75,
        status: "Delivered",
        total_items: 1,
      },
    ],
  },
};

const QueryRunner = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("Predefined");
  const [selectedQuery, setSelectedQuery] = useState(PREDEFINED_QUERIES[3]);
  const [query, setQuery] = useState(PREDEFINED_QUERIES[3].query);
  const [results, setResults] = useState(
    MOCK_RESULTS["Customer Order History"]
  );
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleQuerySelect = (query) => {
    setSelectedQuery(query);
    setQuery(query.query);
  };

  const handleExecute = () => {
    setLoading(true);
    const startTime = Date.now();

    // Add query to history
    const historyItem = {
      query: query,
      timestamp: new Date().toISOString(),
      title: selectedQuery?.title || "Custom Query",
    };
    setQueryHistory((prev) => [historyItem, ...prev]);

    setTimeout(() => {
      setResults(MOCK_RESULTS["Customer Order History"]);
      setLoading(false);
      setExecutionTime(Date.now() - startTime);
    }, 800);
  };

  const handleExportCSV = () => {
    if (!results || !results.rows || results.rows.length === 0) return;

    // Create CSV content
    const headers = results.columns.join(",");
    const rows = results.rows
      .map((row) =>
        results.columns
          .map((column) =>
            typeof row[column] === "string" ? `"${row[column]}"` : row[column]
          )
          .join(",")
      )
      .join("\n");
    const csvContent = `${headers}\n${rows}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `query_results_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(query).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const toggleFavorite = (query) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.title === query.title);
      if (exists) {
        return prev.filter((f) => f.title !== query.title);
      } else {
        return [...prev, query];
      }
    });
  };

  const isFavorite = (query) => {
    return favorites.some((f) => f.title === query.title);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="search-box">
          <input type="text" placeholder="Search queries..." />
        </div>

        <div className="nav-tabs">
          <span
            className={`nav-tab ${activeTab === "Predefined" ? "active" : ""}`}
            onClick={() => setActiveTab("Predefined")}
          >
            Predefined
          </span>
          <span
            className={`nav-tab ${activeTab === "Favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("Favorites")}
          >
            Favorites
          </span>
          <span
            className={`nav-tab ${activeTab === "History" ? "active" : ""}`}
            onClick={() => setActiveTab("History")}
          >
            History
          </span>
        </div>

        <div className="query-list">
          {activeTab === "Predefined" &&
            PREDEFINED_QUERIES.map((q, index) => (
              <div key={index} className="query-item">
                <div onClick={() => handleQuerySelect(q)}>
                  <div className="query-item-title">
                    {q.title}
                    <span
                      className="favorite-star"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(q);
                      }}
                    >
                      {isFavorite(q) ? "⭐" : "☆"}
                    </span>
                  </div>
                  <div className="query-item-description">{q.description}</div>
                </div>
              </div>
            ))}

          {activeTab === "Favorites" &&
            favorites.map((q, index) => (
              <div
                key={index}
                className="query-item"
                onClick={() => handleQuerySelect(q)}
              >
                <div>
                  <div className="query-item-title">
                    {q.title}
                    <span
                      className="favorite-star"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(q);
                      }}
                    >
                      ⭐
                    </span>
                  </div>
                  <div className="query-item-description">{q.description}</div>
                </div>
              </div>
            ))}

          {activeTab === "History" &&
            queryHistory.map((item, index) => (
              <div
                key={index}
                className="query-item"
                onClick={() => setQuery(item.query)}
              >
                <div>
                  <div className="query-item-title">{item.title}</div>
                  <div className="query-item-description">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-content">
            <h1>SQL Query Runner</h1>
            <ThemeToggle />
          </div>
        </div>

        <div className="editor-section">
          <div className="editor-header">
            SQL Query
            <button
              className="copy-button"
              onClick={handleCopyQuery}
              title="Copy query to clipboard"
            >
              {copySuccess ? "Copied!" : "📋"}
            </button>
          </div>
          <div className="editor-container">
            <AceEditor
              mode="sql"
              theme={isDarkMode ? "dracula" : "github"}
              value={query}
              onChange={setQuery}
              name="sql-editor"
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="200px"
              fontSize={14}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </div>
          <button className="execute-button" onClick={handleExecute}>
            Execute
          </button>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2>
              Results{" "}
              {results.rows.length > 0 ? `(${results.rows.length} rows)` : ""}
            </h2>
            <button className="export-button" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>

          {executionTime && (
            <div className="execution-time">
              Query executed in {executionTime}ms
            </div>
          )}

          {loading ? (
            <div className="loading">Executing query...</div>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  {results.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row, index) => (
                  <tr key={index}>
                    {results.columns.map((column) => (
                      <td key={column}>{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryRunner;
