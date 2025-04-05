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
  "Select All Customers": {
    columns: [
      "customer_id",
      "name",
      "email",
      "country",
      "join_date",
      "orders_count",
      "total_spent",
    ],
    rows: Array.from({ length: 1000 }, (_, i) => ({
      customer_id: i + 1,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      country: ["USA", "UK", "Canada", "Australia", "Germany"][
        Math.floor(Math.random() * 5)
      ],
      join_date: new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 2
      )
        .toISOString()
        .split("T")[0],
      orders_count: Math.floor(Math.random() * 50),
      total_spent: (Math.random() * 10000).toFixed(2),
    })),
  },

  "Top Products by Revenue": {
    columns: [
      "product_id",
      "name",
      "category",
      "revenue",
      "units_sold",
      "avg_rating",
    ],
    rows: Array.from({ length: 500 }, (_, i) => ({
      product_id: i + 1,
      name: `Product ${i + 1}`,
      category: ["Electronics", "Clothing", "Books", "Home", "Sports"][
        Math.floor(Math.random() * 5)
      ],
      revenue: (Math.random() * 1000000).toFixed(2),
      units_sold: Math.floor(Math.random() * 10000),
      avg_rating: (3 + Math.random() * 2).toFixed(1),
    })),
  },

  "Monthly Sales Analysis": {
    columns: [
      "month",
      "total_orders",
      "revenue",
      "avg_order_value",
      "new_customers",
    ],
    rows: Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        total_orders: Math.floor(Math.random() * 10000),
        revenue: (Math.random() * 1000000).toFixed(2),
        avg_order_value: (Math.random() * 200 + 50).toFixed(2),
        new_customers: Math.floor(Math.random() * 1000),
      };
    }),
  },

  "Customer Order History": {
    columns: [
      "order_id",
      "order_date",
      "items",
      "total_amount",
      "status",
      "shipping_address",
    ],
    rows: Array.from({ length: 750 }, (_, i) => ({
      order_id: 1000000 + i,
      order_date: new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365
      )
        .toISOString()
        .split("T")[0],
      items: Math.floor(Math.random() * 10) + 1,
      total_amount: (Math.random() * 500 + 20).toFixed(2),
      status: ["Delivered", "Shipped", "Processing", "Cancelled"][
        Math.floor(Math.random() * 4)
      ],
      shipping_address: `${Math.floor(
        Math.random() * 9999
      )} Main St, City ${Math.floor(Math.random() * 100)}`,
    })),
  },

  "Inventory Status Report": {
    columns: [
      "sku",
      "product_name",
      "current_stock",
      "reorder_point",
      "supplier",
      "last_restock_date",
      "status",
    ],
    rows: Array.from({ length: 600 }, (_, i) => ({
      sku: `SKU${String(i + 1).padStart(6, "0")}`,
      product_name: `Product ${i + 1}`,
      current_stock: Math.floor(Math.random() * 1000),
      reorder_point: 100,
      supplier: `Supplier ${Math.floor(Math.random() * 20) + 1}`,
      last_restock_date: new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30
      )
        .toISOString()
        .split("T")[0],
      status: Math.random() > 0.7 ? "Restock needed" : "OK",
    })),
  },
};

const QueryRunner = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("Predefined");
  const [selectedQuery, setSelectedQuery] = useState(PREDEFINED_QUERIES[3]);
  const [query, setQuery] = useState(PREDEFINED_QUERIES[3].query);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [userQueries, setUserQueries] = useState([]);
  const [showAddQueryModal, setShowAddQueryModal] = useState(false);
  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    query: "",
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customQuery, setCustomQuery] = useState({
    title: "",
    description: "",
    query: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAddQuery = () => {
    if (!newQuery.title || !newQuery.description || !newQuery.query) {
      alert("Please fill in all fields");
      return;
    }

    const queryToAdd = {
      ...newQuery,
      id: Date.now(), // Unique identifier
    };

    setUserQueries((prev) => [...prev, queryToAdd]);
    setShowAddQueryModal(false);
    setNewQuery({ title: "", description: "", query: "" });
  };

  const handleDeleteQuery = (queryId) => {
    setUserQueries((prev) => prev.filter((q) => q.id !== queryId));
    // Also remove from favorites if it's there
    setFavorites((prev) => prev.filter((q) => q.id !== queryId));
  };

  const handleSaveClick = () => {
    setCustomQuery({
      title: "",
      description: "",
      query: query, // Current query from the editor
    });
    setShowSaveModal(true);
  };

  const handleSaveCustomQuery = () => {
    if (!customQuery.title) {
      alert("Please enter a name for your query");
      return;
    }

    const queryToSave = {
      ...customQuery,
      id: Date.now(),
    };

    setUserQueries((prev) => [...prev, queryToSave]);
    setFavorites((prev) => [...prev, queryToSave]);
    setShowSaveModal(false);
  };

  const filterQueries = (queries) => {
    return queries.filter(
      (q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderQueryList = () => {
    let queries =
      activeTab === "Predefined"
        ? [...PREDEFINED_QUERIES, ...userQueries]
        : activeTab === "Favorites"
        ? favorites
        : queryHistory;

    // Apply search filter
    queries = filterQueries(queries);

    return queries.map((q, index) => (
      <div key={q.id || index} className="query-item">
        <div onClick={() => handleQuerySelect(q)}>
          <div className="query-item-title">
            {q.title}
            {activeTab === "Predefined" && (
              <span
                className="favorite-star"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(q);
                }}
              >
                {isFavorite(q) ? "⭐" : "☆"}
              </span>
            )}
          </div>
          <div className="query-item-description">{q.description}</div>
        </div>
        {activeTab === "Predefined" && q.id && (
          <button
            className="delete-query-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuery(q.id);
            }}
          >
            🗑️
          </button>
        )}
      </div>
    ));
  };

  const renderResults = () => {
    if (loading) {
      return <div className="loading">Executing query...</div>;
    }

    if (!results) {
      return <div className="no-results">Execute a query to see results</div>;
    }

    if (!results.rows || results.rows.length === 0) {
      return <div className="no-results">No results to display</div>;
    }

    return (
      <>
        <div className="results-header">
          <div className="results-info">
            {results.rows.length.toLocaleString()} rows
            {executionTime && ` • ${executionTime}ms`}
          </div>
          <button className="export-button" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
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
      </>
    );
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

        {activeTab === "Predefined" && (
          <button
            className="add-query-button"
            onClick={() => setShowAddQueryModal(true)}
          >
            + Add New Query
          </button>
        )}

        <div className="query-list">{renderQueryList()}</div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-content">
            <h1>SQL Query Runner</h1>
            <ThemeToggle />
          </div>
          <div className="header-actions">
            <button
              className="save-query-button"
              onClick={handleSaveClick}
              title="Save current query to favorites"
            >
              Save ⭐
            </button>
            <button className="execute-button" onClick={handleExecute}>
              Execute Query
            </button>
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
        </div>

        <div className="results-section">{renderResults()}</div>
      </div>

      {showAddQueryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Query</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newQuery.title}
                  onChange={(e) =>
                    setNewQuery({ ...newQuery, title: e.target.value })
                  }
                  placeholder="Enter query title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newQuery.description}
                  onChange={(e) =>
                    setNewQuery({ ...newQuery, description: e.target.value })
                  }
                  placeholder="Enter query description"
                />
              </div>
              <div className="form-group">
                <label>Query</label>
                <AceEditor
                  mode="sql"
                  theme={isDarkMode ? "dracula" : "github"}
                  value={newQuery.query}
                  onChange={(value) =>
                    setNewQuery({ ...newQuery, query: value })
                  }
                  name="new-query-editor"
                  width="100%"
                  height="150px"
                  fontSize={14}
                  showPrintMargin={false}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowAddQueryModal(false)}
              >
                Cancel
              </button>
              <button className="save-button" onClick={handleAddQuery}>
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Save Custom Query</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Query Name</label>
                <input
                  type="text"
                  value={customQuery.title}
                  onChange={(e) =>
                    setCustomQuery({ ...customQuery, title: e.target.value })
                  }
                  placeholder="Enter a name for your query"
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={customQuery.description}
                  onChange={(e) =>
                    setCustomQuery({
                      ...customQuery,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter a description"
                />
              </div>
              <div className="query-preview">
                <label>Query</label>
                <pre>{customQuery.query}</pre>
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>
                <button className="save-button" onClick={handleSaveCustomQuery}>
                  Save to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryRunner;
