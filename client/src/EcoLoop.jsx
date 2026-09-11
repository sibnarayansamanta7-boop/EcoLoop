import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { api } from "./api";
import {
  ArrowRight,
  ArrowUpRight,
  Backpack,
  BookOpen,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Cpu,
  Gift,
  HandHeart,
  Home as HomeIcon,
  Leaf,
  Mail,
  MessageCircle,
  MapPin,
  Menu,
  Package,
  PenLine,
  Plus,
  Recycle,
  Search,
  Shirt,
  Sparkles,
  Trophy,
  Users,
  X,
  FlaskConical,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";
import "./ecoloop.css";

const CATEGORIES = [
  { id: "books", label: "Books", icon: BookOpen, waste: 0.3 },
  { id: "electronics", label: "Electronics", icon: Cpu, waste: 2.1 },
  { id: "lab", label: "Lab & Equipment", icon: FlaskConical, waste: 1.5 },
  { id: "hostel", label: "Hostel", icon: HomeIcon, waste: 1.2 },
  { id: "bags", label: "Bags", icon: Backpack, waste: 0.8 },
  { id: "clothing", label: "Clothing", icon: Shirt, waste: 0.5 },
  { id: "stationery", label: "Stationery", icon: PenLine, waste: 0.1 },
];

const MODES = {
  sell: { label: "Sell", icon: CircleDollarSign },
  exchange: { label: "Exchange", icon: Recycle },
  donate: { label: "Donate", icon: Gift },
};

const SEED_LISTINGS = [
  {
    id: 1,
    title: "Engineering Mathematics — Vol II",
    category: "books",
    condition: "Good",
    mode: "exchange",
    value: 180,
    owner: "Ananya",
    desc: "Clean copy, ideal for second-year students.",
    tone: "paper",
  },
  {
    id: 2,
    title: "Scientific Calculator fx-991ES",
    category: "electronics",
    condition: "Excellent",
    mode: "sell",
    value: 600,
    owner: "Rahul",
    desc: "Original case included. Barely used.",
    tone: "mint",
  },
  {
    id: 3,
    title: "Lab Coat — Size M",
    category: "clothing",
    condition: "Excellent",
    mode: "exchange",
    value: 150,
    owner: "Priya",
    desc: "Looking to exchange for a size L.",
    tone: "lavender",
  },
  {
    id: 4,
    title: "Hostel Study Lamp",
    category: "hostel",
    condition: "Good",
    mode: "donate",
    value: 300,
    owner: "Sibnarayan",
    desc: "Works perfectly. Free for a first-year.",
    tone: "sun",
  },
  {
    id: 5,
    title: "Engineering Drawing Board",
    category: "lab",
    condition: "Good",
    mode: "sell",
    value: 250,
    owner: "Rahul",
    desc: "Used one semester, minor case scuffs.",
    tone: "blue",
  },
  {
    id: 6,
    title: "Canvas Backpack",
    category: "bags",
    condition: "Good",
    mode: "sell",
    value: 400,
    owner: "Ananya",
    desc: "Laptop sleeve and water-resistant fabric.",
    tone: "peach",
  },
];

const ART = {
  books: ["book", "BOOKS"],
  electronics: ["calculator", "ELECTRONICS"],
  lab: ["lab", "LAB"],
  hostel: ["lamp", "HOSTEL"],
  bags: ["bag", "BAGS"],
  clothing: ["coat", "CLOTHING"],
  stationery: ["stationery", "STATIONERY"],
};

function ItemArt({ category, tone = "paper", large = false }) {
  const [kind, label] = ART[category] || ["item", "ITEM"];

  return (
    <div className={`item-art tone-${tone} ${large ? "item-art-large" : ""}`}>
      <div className={`art-object object-${kind}`}>
        {category === "books" && <BookOpen size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "electronics" && <Cpu size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "lab" && <FlaskConical size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "hostel" && <HomeIcon size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "bags" && <Backpack size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "clothing" && <Shirt size={large ? 48 : 34} strokeWidth={1.5} />}
        {category === "stationery" && <PenLine size={large ? 48 : 34} strokeWidth={1.5} />}
      </div>
      <span>{label}</span>
    </div>
  );
}

function Logo() {
  return (
    <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="logo-mark"><Recycle size={20} /></span>
      <span>Eco<span>Loop</span></span>
    </button>
  );
}

export default function EcoLoop() {
  const [view, setView] = useState("home");

  const [listings, setListings] = useState([]);

  const [requests, setRequests] = useState({
    incoming: [],
    outgoing: [],
  });

  const [myListings, setMyListings] = useState([]);

  const [impact, setImpact] = useState({
    itemsReused: 0,
    wasteDiverted: 0,
    valueCirculated: 0,
    reuseSuccess: 0,
  });

  const [leaderboard, setLeaderboard] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("all");

  const [mode, setMode] =
    useState("all");

    const [campusOnly, setCampusOnly] =
  useState(false);

  const [showCreate, setShowCreate] =
    useState(false);

  const [mobileNav, setMobileNav] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [authMode, setAuthMode] =
    useState(null);

  const [conversations, setConversations] =
    useState([]);

  const [chatContext, setChatContext] =
    useState(null);

  const [user, setUser] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "ecoloop_user"
          )
        );
      } catch {
        return null;
      }
    });

  const isLoggedIn =
    Boolean(
      localStorage.getItem(
        "ecoloop_token"
      )
    );

  const flash = (message) => {
    setToast(message);

    window.clearTimeout(
      window.__ecoLoopToast
    );

    window.__ecoLoopToast =
      window.setTimeout(
        () => setToast(""),
        2500
      );
  };

  const go = (next) => {
    setView(next);

    setMobileNav(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loadListings = async () => {
    try {
      const data =
        await api.listings();

      setListings(
        data.listings || []
      );
    } catch (error) {
      flash(error.message);
    }
  };

  const loadRequests = async () => {
    if (!localStorage.getItem("ecoloop_token")) {
      return;
    }

    try {
      const data =
        await api.requests();

      setRequests({
        incoming:
          data.incoming || [],
        outgoing:
          data.outgoing || [],
      });
    } catch (error) {
      console.error(
        "Requests:",
        error.message
      );
    }
  };

  const loadMyListings = async () => {
    if (!localStorage.getItem("ecoloop_token")) {
      return;
    }

    try {
      const data =
        await api.myListings();

      setMyListings(
        data.listings || []
      );
    } catch (error) {
      console.error(
        "My listings:",
        error.message
      );
    }
  };

const loadImpact = async () => {
  try {
    const data = await api.impact();

    setImpact(
      data.impact || {}
    );
  } catch (error) {
    console.error(
      "Impact:",
      error.message
    );
  }
};

  const loadLeaderboard =
    async () => {
      try {
        const data =
          await api.leaderboard();

        setLeaderboard(
          data.leaderboard || []
        );
      } catch (error) {
        console.error(
          "Leaderboard:",
          error.message
        );
      }
    };

  const loadConversations = async () => {
    if (!localStorage.getItem("ecoloop_token")) {
      setConversations([]);
      return;
    }

    try {
      const data = await api.conversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Conversations:", error.message);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      loadListings(),
      loadRequests(),
      loadMyListings(),
      loadImpact(),
      loadLeaderboard(),
      loadConversations(),
    ]);
  };

  useEffect(() => {
    const start =
      async () => {
        setLoading(true);

        await refreshAll();

        setLoading(false);
      };

    start();
  }, []);

  const requestItem =
    async (item) => {
      if (!localStorage.getItem(
        "ecoloop_token"
      )) {
        setAuthMode("login");

        flash(
          "Please sign in to request an item."
        );

        return;
      }

      try {
        await api.createRequest(
          item._id || item.id
        );

        flash(
          "Request sent to the owner."
        );

        await refreshAll();
      } catch (error) {
        flash(error.message);
      }
    };
const openChat = (item, partner = null) => {
    if (
        !localStorage.getItem(
            "ecoloop_token"
        )
    ) {
        setAuthMode("login");

        flash(
            "Please sign in to chat with a student."
        );

        return;
    }

    const currentUser =
        user ||
        JSON.parse(
            localStorage.getItem(
                "ecoloop_user"
            ) || "null"
        );

    /*
     * Seller information can come in different
     * formats depending on the API response.
     *
     * Priority:
     * 1. item.owner._id
     * 2. item.ownerId
     * 3. item.owner.id
     * 4. item.owner if it is already a string
     */
    let ownerId = null;

    if (
        item?.owner &&
        typeof item.owner === "object"
    ) {
        ownerId =
            item.owner._id ||
            item.owner.id ||
            null;
    }

    if (!ownerId) {
        ownerId =
            item?.ownerId ||
            null;
    }

    if (!ownerId) {
        if (
            typeof item?.owner ===
            "string"
        ) {
            ownerId =
                item.owner;
        }
    }

    console.log(
        "CHAT ITEM:",
        item
    );

    console.log(
        "CHAT OWNER:",
        item?.owner
    );

    console.log(
        "CHAT OWNER ID:",
        ownerId
    );

    if (!ownerId) {
        console.error(
            "CHAT ERROR: Listing has no owner",
            item
        );

        flash(
            "Seller information is unavailable for this item."
        );

        return;
    }

    const currentUserId =
        currentUser?.id ||
        currentUser?._id;

    if (
        String(ownerId) ===
        String(currentUserId)
    ) {
        flash(
            "This is your own listing."
        );

        return;
    }

    const seller =
        partner ||
        (
            item?.owner &&
            typeof item.owner === "object"
                ? item.owner
                : null
        );

    // A real User record is required for chat. Do not invent a seller
    // object when a listing points to a deleted/missing account.
    if (!seller?._id && !seller?.id) {
        flash(
            "This seller account is unavailable. Please choose another item."
        );
        return;
    }

    setChatContext({
        listing: {
            ...item,
            ownerId
        },
        partner: seller
    });
};

  const createListing =
    async (data) => {
      if (!localStorage.getItem(
        "ecoloop_token"
      )) {
        setAuthMode("login");
        return;
      }

      try {
await api.createListing({
  title: data.title,
  category: data.category,
  condition: data.condition,
  mode: data.mode,
  value: Number(data.value || 0),
  description:
    data.description ||
    data.desc ||
    "",
  image: data.image || "",
  handoverLocation:
    data.handoverLocation ||
    "Main Gate",
});

        setShowCreate(false);

        flash(
          "Your item is now in circulation."
        );

        await refreshAll();

        go("marketplace");
      } catch (error) {
        flash(error.message);
      }
    };

  const respondRequest =
    async (
      requestId,
      action
    ) => {
      try {
        await api.respondRequest(
          requestId,
          action
        );

        const messages = {
          accepted:
            "Request accepted.",
          declined:
            "Request declined.",
          completed:
            "Handover completed. Item reused.",
        };

        flash(
          messages[action] ||
          "Request updated."
        );

        await refreshAll();
      } catch (error) {
        flash(error.message);
      }
    };

  const handleAuth =
    async (mode, form) => {
      try {
        const data =
          mode === "login"
            ? await api.login({
                email:
                  form.email,
                password:
                  form.password,
              })
            : await api.register({
  name: form.name,
  email: form.email,
  password: form.password,
  college:
    form.college ||
    "Guru Nanak Institute of Technology",
})

        if (!data.token) {
          throw new Error(
            "Authentication token was not returned."
          );
        }

        localStorage.setItem(
          "ecoloop_token",
          data.token
        );

        localStorage.setItem(
          "ecoloop_user",
          JSON.stringify(
            data.user || {
              name:
                form.name ||
                form.email.split("@")[0],
              email:
                form.email,
            }
          )
        );

        setUser(
          data.user || {
            name:
              form.name ||
              form.email.split("@")[0],
            email:
              form.email,
          }
        );

        setAuthMode(null);

        flash(
          mode === "login"
            ? "Welcome back."
            : "Account created successfully."
        );

        await refreshAll();
      } catch (error) {
        flash(error.message);
      }
    };

  const logout = () => {
    localStorage.removeItem(
      "ecoloop_token"
    );

    localStorage.removeItem(
      "ecoloop_user"
    );

    setUser(null);

    setRequests({
      incoming: [],
      outgoing: [],
    });

    setMyListings([]);
    setConversations([]);
    setChatContext(null);

    flash("You have been signed out.");

    go("home");
  };

const filtered = useMemo(() => {
  const currentCollege =
    user?.college ||
    "Guru Nanak Institute of Technology";

  return listings
    .filter((item) => {
      const ownerName =
        item.owner?.name || "";

      const ownerCollege =
        item.owner?.college || "";

      const description =
        item.description ||
        item.desc ||
        "";

      const text =
        `${item.title} ${description} ${ownerName} ${ownerCollege}`
          .toLowerCase();

      const matchesSearch =
        !search ||
        text.includes(
          search.toLowerCase()
        );

      const matchesCategory =
        category === "all" ||
        item.category === category;

      const matchesMode =
        mode === "all" ||
        item.mode === mode;

      const matchesCampus =
        !campusOnly ||
        !isLoggedIn ||
        ownerCollege ===
          currentCollege;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMode &&
        matchesCampus
      );
    })
    .sort((a, b) => {
      if (!isLoggedIn) return 0;

      const college =
        user?.college ||
        "Guru Nanak Institute of Technology";

      const aSame =
        a.owner?.college === college;

      const bSame =
        b.owner?.college === college;

      return Number(bSame) -
        Number(aSame);
    });
}, [
  listings,
  search,
  category,
  mode,
  campusOnly,
  user,
  isLoggedIn,
]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f2eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <Recycle
            size={42}
            style={{
              marginBottom: 12,
            }}
          />
          <h2>Loading EcoLoop...</h2>
          <p>
            Connecting to the campus loop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell">

      <header className="topbar">
        <div className="topbar-inner">

          <Logo />

          <nav
            className={`main-nav ${
              mobileNav
                ? "mobile-open"
                : ""
            }`}
          >
            <button
              className={
                view === "marketplace"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                go("marketplace")
              }
            >
              Marketplace
            </button>

            <button
              className={
                view === "impact"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                go("impact")
              }
            >
              Impact
            </button>

            <button
              className={
                view === "community"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                go("community")
              }
            >
              Community
            </button>

            {isLoggedIn && (
              <button
                className={
                  view === "messages"
                    ? "nav-active"
                    : ""
                }
                onClick={() => go("messages")}
              >
                <MessageCircle size={15} style={{ verticalAlign: "middle", marginRight: 5 }} />
                Messages
                {conversations.some((conversation) => conversation.unreadCount > 0) && (
                  <span style={{ marginLeft: 5, minWidth: 17, height: 17, borderRadius: 999, background: "#d9ff75", color: "#1b2b1d", display: "inline-grid", placeItems: "center", fontSize: 10, fontWeight: 800 }}>!</span>
                )}
              </button>
            )}

            {isLoggedIn && (
              <button
                className={
                  view === "requests"
                    ? "nav-active"
                    : ""
                }
                onClick={() =>
                  go("requests")
                }
              >
                Requests
              </button>
            )}

            {isLoggedIn && (
              <button
                className={
                  view === "my"
                    ? "nav-active"
                    : ""
                }
                onClick={() =>
                  go("my")
                }
              >
                My Items
              </button>
            )}
          </nav>

          <div className="nav-actions">

            {isLoggedIn ? (
              <button
                className="profile-pill"
                onClick={() =>
                  go("my")
                }
              >
                <span className="avatar">
                  {(
                    user?.name ||
                    "S"
                  )[0].toUpperCase()}
                </span>

                <span className="profile-name">
                  {user?.name ||
                    "Student"}
                </span>
              </button>
            ) : (
              <button
                className="button-secondary"
                onClick={() =>
                  setAuthMode("login")
                }
              >
                Sign in
              </button>
            )}

            <button
              className="list-button"
              onClick={() => {
                if (!isLoggedIn) {
                  setAuthMode("login");
                  return;
                }

                setShowCreate(true);
              }}
            >
              <Plus size={17} />
              List an item
            </button>

            <button
              className="mobile-menu"
              onClick={() =>
                setMobileNav(
                  (v) => !v
                )
              }
            >
              {mobileNav ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>
      </header>

      {view === "home" && (
        <Home
          go={go}
          openCreate={() => {
            if (!isLoggedIn) {
              setAuthMode("login");
              return;
            }

            setShowCreate(true);
          }}
          listings={listings}
          requestItem={
            requestItem
          }
          openChat={openChat}
          reused={
            impact.itemsReused
          }
          waste={
            impact.wasteDiverted
          }
          savings={
            impact.valueCirculated
          }
        />
      )}

      {view === "marketplace" && (
        <Marketplace
          listings={filtered}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          mode={mode}
          setMode={setMode}
          requestItem={
            requestItem
          }
          campusOnly={campusOnly}
          setCampusOnly={setCampusOnly}
          openChat={openChat}
          openCreate={() => {
            if (!isLoggedIn) {
              setAuthMode("login");
              return;
            }

            setShowCreate(true);
          }}
        />
      )}

      {view === "impact" && (
        <Impact
          reused={
            impact.itemsReused
          }
          waste={
            impact.wasteDiverted
          }
          savings={
            impact.valueCirculated
          }
        />
      )}

      {view === "community" && (
        <Community
          leaderboard={
            leaderboard
          }
        />
      )}

      {view === "requests" &&
        isLoggedIn && (
          <RequestsView
            requests={requests}
            respondRequest={
              respondRequest
            }
          />
        )}

      {view === "messages" &&
        isLoggedIn && (
          <MessagesView
            conversations={conversations}
            openChat={openChat}
          />
        )}

      {view === "my" &&
        isLoggedIn && (
          <MyItems
            listings={
              myListings
            }
            logout={logout}
          />
        )}

      {showCreate && (
        <CreateModal
          close={() =>
            setShowCreate(false)
          }
          submit={
            createListing
          }
        />
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          close={() =>
            setAuthMode(null)
          }
          submit={handleAuth}
          switchMode={() =>
            setAuthMode(
              authMode === "login"
                ? "register"
                : "login"
            )
          }
        />
      )}

      {chatContext && (
        <ChatModal
          listing={chatContext.listing}
          partner={chatContext.partner}
          close={() => setChatContext(null)}
          refreshConversations={loadConversations}
          flash={flash}
        />
      )}

      {toast && (
        <div className="toast">
          <span>
            <Check size={16} />
          </span>

          {toast}
        </div>
      )}
    </div>
  );
}
function Home({
  go,
  openCreate,
  listings,
  requestItem,
  openChat,
  reused,
  waste,
  savings
}) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span /> CAMPUS CIRCULAR ECONOMY</div>
          <h1>
            Your campus
            <br />
            <em>can circulate.</em>
          </h1>
          <p>
            Give useful things another life. Buy, exchange or donate
            campus essentials before they become waste.
          </p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => go("marketplace")}>
              Explore marketplace <ArrowRight size={17} />
            </button>
            <button className="button-secondary" onClick={openCreate}>
              <Plus size={17} /> List something
            </button>
          </div>
          <div className="hero-note">
            <span className="mini-avatars"><i>A</i><i>R</i><i>P</i><i>+</i></span>
            <span><strong>500+ students</strong> are already keeping items in use.</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card visual-main">
            <div className="visual-top">
              <span className="live-dot"><i /> LIVE CAMPUS LOOP</span>
              <span>SEP 2026</span>
            </div>
            <div className="visual-orbit">
              <div className="orbit-line orbit-one" />
              <div className="orbit-line orbit-two" />
              <div className="orbit-center">
                <div className="orbit-icon"><Recycle size={42} /></div>
                <strong>REUSE</strong>
                <span>not replace</span>
              </div>
              <div className="orbit-node node-book"><BookOpen size={17} /></div>
              <div className="orbit-node node-bag"><Backpack size={17} /></div>
              <div className="orbit-node node-coat"><Shirt size={17} /></div>
              <div className="orbit-node node-calc"><Cpu size={17} /></div>
            </div>
            <div className="visual-footer">
              <div><strong>{(1284 + reused).toLocaleString()}</strong><span>items reused</span></div>
              <div><strong>{(642 + waste).toFixed(1)} kg</strong><span>waste diverted</span></div>
              <div><strong>₹{(380000 + savings).toLocaleString("en-IN")}</strong><span>value circulated</span></div>
            </div>
          </div>
          <div className="floating-card floating-match">
            <span className="floating-icon"><Sparkles size={16} /></span>
            <div><small>SMART MATCH</small><strong>3 students need this</strong></div>
          </div>
          <div className="floating-card floating-impact">
            <Leaf size={18} />
            <div><strong>+2.1 kg</strong><small>estimated impact</small></div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>ONE CAMPUS.</span>
        <strong>THOUSANDS OF THINGS.</strong>
        <span>ONE SHARED LOOP.</span>
      </section>

      <section className="market-preview section">
        <SectionHeading
          kicker="FIND YOUR NEXT"
          title={<>Things worth finding, <em>already here.</em></>}
          text="Browse useful items from students around your campus."
          action={<button className="text-button" onClick={() => go("marketplace")}>View all <ArrowUpRight size={16} /></button>}
        />
        <div className="preview-grid">
{listings.slice(0, 4).map((item) => (
  <ListingCard
    key={item._id || item.id}
    item={item}
    requestItem={requestItem}
    openChat={openChat}
  />
))}
          
        </div>
      </section>

      <section className="how-section section">
        <div className="how-intro">
          <div className="section-kicker">THE LOOP</div>
          <h2>Simple for students.<br /><em>Better for the campus.</em></h2>
          <p>Every item follows the same journey — from unused to useful again.</p>
        </div>
        <div className="steps-grid">
          {[
            ["01", "List", "Post something you no longer need.", Package],
            ["02", "Discover", "Find useful things nearby.", Search],
            ["03", "Connect", "Request an item and coordinate.", Users],
            ["04", "Reuse", "Complete the handover and close the loop.", Recycle],
          ].map(([number, title, text, Icon]) => (
            <div className="step-card" key={number}>
              <span>{number}</span>
              <div className="step-icon"><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowUpRight size={17} />
            </div>
          ))}
        </div>
      </section>

      <section className="impact-callout section">
        <div>
          <div className="section-kicker">WHY ECOLOOP</div>
          <h2>Waste is often just<br /><em>an unused possibility.</em></h2>
          <p>When a student passes an item forward instead of buying new, the campus gets a little lighter — and another student gets what they need.</p>
          <button className="button-dark" onClick={() => go("impact")}>See our impact <ArrowRight size={17} /></button>
        </div>
        <div className="impact-number-grid">
          <div><strong>1,284</strong><span>items reused</span></div>
          <div><strong>642 kg</strong><span>waste diverted</span></div>
          <div><strong>₹3.8L</strong><span>value circulated</span></div>
          <div><strong>87%</strong><span>reuse success</span></div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-leaf"><Leaf size={22} /></div>
        <div>
          <div className="section-kicker">START THE LOOP</div>
          <h2>What do you have<br /><em>left to pass on?</em></h2>
        </div>
        <button className="button-primary" onClick={openCreate}>List an item <ArrowUpRight size={17} /></button>
      </section>

      <Footer />
    </main>
  );
}

function Marketplace({
  listings,
  search,
  setSearch,
  category,
  setCategory,
  mode,
  setMode,
  requestItem,
  openChat,
  openCreate,
  campusOnly,
  setCampusOnly,
}) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <div className="section-kicker">MARKETPLACE</div>
          <h1>Find useful things<br /><em>already on campus.</em></h1>
          <p>Skip the new purchase. Find it, request it, keep it moving.</p>
        </div>
        <button className="button-primary" onClick={openCreate}><Plus size={17} /> List an item</button>
      </section>

      <section className="market-tools">
        <button
  className={
    campusOnly
      ? "button-primary"
      : "button-secondary"
  }
  onClick={() =>
    setCampusOnly(
      (current) => !current
    )
  }
>
  <GraduationCap size={16} />

  {campusOnly
    ? "My Campus"
    : "All Campuses"}
</button>
        <div className="search-box">
          <Search size={19} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search books, calculators, lab coats..." />
          {search && <button onClick={() => setSearch("")}><X size={16} /></button>}
        </div>
        <div className="select-wrap">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="all">All ways</option>
            <option value="sell">Buy</option>
            <option value="exchange">Exchange</option>
            <option value="donate">Donate</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </section>

      <div className="category-row">
        <button className={category === "all" ? "category-active" : ""} onClick={() => setCategory("all")}>All items</button>
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button key={id} className={category === id ? "category-active" : ""} onClick={() => setCategory(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="market-meta">
        <span><strong>{listings.length}</strong> items available</span>
        <span>Sorted by <strong>recently listed</strong></span>
      </div>

      {listings.length ? (
        <div className="market-grid">
          {listings.map((item) => (
  <ListingCard
    key={item._id || item.id}
    item={item}
    requestItem={requestItem}
    openChat={openChat}
  />
))}
        </div>
      ) : (
        <div className="empty-market">
          <div><Search size={25} /></div>
          <h3>No items found</h3>
          <p>Try another search or category.</p>
          <button className="button-secondary" onClick={() => { setSearch(""); setCategory("all"); setMode("all"); }}>Clear filters</button>
        </div>
      )}
      <Footer />
    </main>
  );
}

function ListingCard({
  item,
  requestItem,
  openChat,
}) {
  const category =
    CATEGORIES.find(
      (c) => c.id === item.category
    ) || CATEGORIES[0];

  const ModeIcon =
    MODES[item.mode]?.icon || Gift;

  const modeLabel =
    MODES[item.mode]?.label ||
    "Donate";

  const ownerName =
    typeof item.owner === "object"
      ? item.owner?.name ||
        "Seller unavailable"
      : item.owner ||
        "Seller unavailable";

  const ownerCollege =
    typeof item.owner === "object"
      ? item.owner?.college ||
        "Campus"
      : "Campus";

  const description =
    item.description ||
    item.desc ||
    "";

  const handoverLocation =
    item.handoverLocation ||
    "Main Gate";

  const currentCollege =
    localStorage.getItem(
      "ecoloop_user"
    )
      ? JSON.parse(
          localStorage.getItem(
            "ecoloop_user"
          )
        )?.college
      : "";

  const sameCollege =
    currentCollege &&
    ownerCollege === currentCollege;

  return (
    <article className="listing-card">
      <div className="card-art-wrap">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <ItemArt
            category={item.category}
            tone={item.tone}
          />
        )}

        <span className="condition-badge">
          {item.condition}
        </span>

        <span className="mode-badge">
          <ModeIcon size={13} />
          {modeLabel}
        </span>
      </div>

      <div className="card-content">
        <div className="card-category">
          {category.label}
        </div>

        <h3>{item.title}</h3>

        <p>{description}</p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 7,
            marginTop: 12,
          }}
        >
          {sameCollege && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 9px",
                borderRadius: 999,
                background: "#e5f5d8",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <GraduationCap size={13} />
              Same campus
            </span>
          )}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 9px",
              borderRadius: 999,
              background: "#f0eee6",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <MapPin size={13} />
            {handoverLocation}
          </span>
        </div>

        <div className="card-bottom">
          <div className="owner">
            <span>
              {ownerName
                .charAt(0)
                .toUpperCase()}
            </span>

            {ownerName}
          </div>

          {item.mode === "donate" ? (
            <strong className="free-label">
              FREE
            </strong>
          ) : (
            <strong className="price-label">
              ₹
              {Number(
                item.value || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>
          )}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          <GraduationCap
            size={13}
            style={{
              verticalAlign:
                "middle",
              marginRight: 5,
            }}
          />

          {ownerCollege}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 10,
          }}
        >
          <button
            type="button"
            onClick={() => openChat(item)}
            disabled={item.chatAvailable === false}
            title={
              item.chatAvailable === false
                ? "Seller account unavailable"
                : "Chat with seller"
            }
            style={{
              minHeight: 44,
              borderRadius: 12,
              border: "1px solid #d8dfd2",
              background: "#f1f5ec",
              color: "#27402d",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              cursor:
                item.chatAvailable === false
                  ? "not-allowed"
                  : "pointer",
              opacity:
                item.chatAvailable === false
                  ? 0.55
                  : 1,
            }}
          >
            <MessageCircle size={16} />
            {item.chatAvailable === false
              ? "Seller unavailable"
              : "Chat seller"}
          </button>

          <button
          className={`card-request ${
            item.status ===
            "requested"
              ? "requested"
              : ""
          }`}
          onClick={() =>
            requestItem(item)
          }
          disabled={
            item.status ===
            "requested"
          }
        >
          {item.status ===
          "requested" ? (
            <>
              <Check size={15} />
              Requested
            </>
          ) : (
            <>
              Request item
              <ArrowUpRight
                size={15}
              />
            </>
          )}
        </button>
        </div>
      </div>
    </article>
  );
}

function Impact({ reused, waste, savings }) {
  return (
    <main className="page-shell">
      <section className="page-hero impact-hero">
        <div>
          <div className="section-kicker">CAMPUS IMPACT</div>
          <h1>Keep products moving.<br /><em>Keep waste out.</em></h1>
          <p>EcoLoop turns completed handovers into measurable circular-economy outcomes.</p>
        </div>
        <div className="impact-badge"><Leaf size={18} /><strong>Positive loop</strong><span>Every reuse counts.</span></div>
      </section>

      <section className="impact-dashboard">
        <div className="impact-stat featured"><span>ITEMS REUSED</span><strong>{(1284 + reused).toLocaleString()}</strong><small>+{reused} this session</small></div>
        <div className="impact-stat"><span>WASTE DIVERTED</span><strong>{(642 + waste).toFixed(1)} kg</strong><small>estimated campus total</small></div>
        <div className="impact-stat"><span>VALUE CIRCULATED</span><strong>₹{(380000 + savings).toLocaleString("en-IN")}</strong><small>estimated student savings</small></div>
        <div className="impact-stat"><span>REUSE SUCCESS</span><strong>87%</strong><small>of requested items</small></div>
      </section>

      <section className="impact-story">
        <div className="story-copy">
          <div className="section-kicker">THE IDEA</div>
          <h2>One item can make<br /><em>more than one impact.</em></h2>
          <p>A calculator that moves from a senior to a junior avoids another purchase. A lab coat passed forward avoids another product entering the campus. Multiply that by thousands of students, and the loop becomes meaningful.</p>
        </div>
        <div className="impact-ring">
          <div className="ring-inner"><Recycle size={38} /><strong>2.1 kg</strong><span>potential waste<br />avoided</span></div>
        </div>
      </section>

      <section className="category-impact">
        <div className="section-kicker">WHERE THE LOOP STARTS</div>
        <h2>Items students <em>pass forward.</em></h2>
        <div className="impact-bars">
          {[
            ["Books", 78],
            ["Electronics", 61],
            ["Lab & Equipment", 48],
            ["Hostel", 37],
            ["Clothing", 31],
          ].map(([label, value]) => (
            <div className="impact-bar" key={label}>
              <div><span>{label}</span><strong>{value}%</strong></div>
              <div className="bar-track"><i style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Community({ leaderboard = [] }) {
 const rows = leaderboard.length
  ? leaderboard.map(
      (person) => [
        person.name,
        person.points,
        `${person.itemsReused} items`,
      ]
    )
  : [
      ["No contributors yet", 0, "0 items"],
    ];

  return (
    <main className="page-shell">
      <section className="page-hero community-hero">
        <div>
          <div className="section-kicker">COMMUNITY</div>
          <h1>The people<br /><em>behind the loop.</em></h1>
          <p>Recognition for students who keep useful products circulating across campus.</p>
        </div>
        <div className="community-stat"><Trophy size={22} /><strong>2,140</strong><span>community points earned</span></div>
      </section>

      <section className="leaderboard">
        <div className="leader-head">
          <div><div className="section-kicker">TOP CONTRIBUTORS</div><h2>Reuse <em>champions.</em></h2></div>
          <span>This month</span>
        </div>
        {rows.map(([name, points, items], index) => (
          <div className={`leader-row ${name === "Sibnarayan" ? "you-row" : ""}`} key={name}>
            <strong className="leader-rank">{String(index + 1).padStart(2, "0")}</strong>
            <span className="leader-avatar">{name[0]}</span>
            <div className="leader-name"><strong>{name}{name === "Sibnarayan" && " · you"}</strong><small>{items} reused</small></div>
            <div className="leader-progress"><i style={{ width: `${(points / 310) * 100}%` }} /></div>
            <strong className="leader-points">{points} pts</strong>
          </div>
        ))}
      </section>
      <Footer />
    </main>
  );
}

function SectionHeading({ kicker, title, text, action }) {
  return (
    <div className="section-heading">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function CreateModal({ close, submit }) {
 const [form, setForm] = useState({
  title: "",
  category: "books",
  condition: "Good",
  mode: "sell",
  value: "",
  desc: "",
  image: "",
  handoverLocation: "Main Gate",
});

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));
  const canSubmit = form.title.trim() && form.desc.trim() && (form.mode === "donate" || form.value);

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="create-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}><X size={19} /></button>
        <div className="modal-art"><HandHeart size={30} /></div>
        <div className="section-kicker">NEW LISTING</div>
        <h2>Give an item its<br /><em>next life.</em></h2>
        <p className="modal-sub">Tell the campus what you have. Someone may be looking for exactly this.</p>

        <div className="form-grid">
          <label className="full-field">Item name<input value={form.title} onChange={update("title")} placeholder="e.g. Engineering Mathematics — Vol I" /></label>
          <label>Category
            <select value={form.category} onChange={update("category")}>
              {CATEGORIES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label>Condition
            <select value={form.condition} onChange={update("condition")}>
              <option>Excellent</option><option>Good</option><option>Fair</option>
            </select>
          </label>
          <label>How do you want to pass it on?
            <select value={form.mode} onChange={update("mode")}>
              <option value="sell">Sell</option><option value="exchange">Exchange</option><option value="donate">Donate</option>
            </select>
          </label>
          <label>Value {form.mode === "donate" && <span className="optional">optional</span>}
            <input type="number" value={form.value} onChange={update("value")} placeholder="₹ 250" />
          </label>
          <label className="full-field">
  Description
  <textarea
    value={form.desc}
    onChange={update("desc")}
    rows="3"
    placeholder="Condition, useful details, what you're looking for..."
  />
</label>

          <label className="full-field">
  Handover point

  <select
    value={form.handoverLocation}
    onChange={update("handoverLocation")}
  >
    <option value="Main Gate">
      Main Gate
    </option>

    <option value="Central Library">
      Central Library
    </option>

    <option value="Canteen">
      Canteen
    </option>

    <option value="Admin Block">
      Admin Block
    </option>

    <option value="Department">
      Department
    </option>

    <option value="Hostel">
      Hostel
    </option>
  </select>

  <small
    style={{
      display: "block",
      marginTop: 7,
      opacity: 0.65,
    }}
  >
    Choose a public campus spot for an easy handover.
  </small>
</label>
        <label className="full-field">
  Item photo
  <div
    style={{
      marginTop: 10,
      padding: 18,
      border: "1px dashed rgba(23, 32, 24, 0.25)",
      borderRadius: 16,
      background: "rgba(255,255,255,0.45)",
    }}
  >
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert("Please choose an image smaller than 5MB.");
          return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
          setForm((current) => ({
            ...current,
            image: reader.result,
          }));
        };

        reader.readAsDataURL(file);
      }}
    />

    {form.image && (
      <img
        src={form.image}
        alt="Item preview"
        style={{
          width: "100%",
          maxHeight: 220,
          objectFit: "cover",
          borderRadius: 12,
          marginTop: 14,
        }}
      />
    )}
  </div>
</label>
        </div>

        <button className="button-primary full-button" disabled={!canSubmit} onClick={() => submit({ ...form, value: Number(form.value || 0) })}>
          Publish listing <ArrowUpRight size={17} />
        </button>
      </div>
    </div>
  );
}
function AuthModal({ mode, close, submit, switchMode }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "Guru Nanak Institute of Technology",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const isRegister = mode === "register";
  const valid =
    form.email.trim() &&
    form.password.trim().length >= 6 &&
    (!isRegister || (form.name.trim() && form.college.trim()));

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await submit(mode, form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="eco-auth-overlay" onMouseDown={close}>
      <style>{`
        .eco-auth-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 22px;
          background: rgba(20, 32, 23, .48);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overflow-y: auto;
        }

        .eco-auth-overlay::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .16;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E");
        }

        .eco-auth-card {
          position: relative;
          z-index: 1;
          width: min(920px, 100%);
          min-height: 590px;
          display: grid;
          grid-template-columns: .92fr 1.08fr;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.62);
          border-radius: 30px;
          background: rgba(249, 247, 238, .91);
          box-shadow: 0 30px 90px rgba(10, 30, 18, .28), 0 8px 30px rgba(10, 30, 18, .12);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .eco-auth-photo {
          position: relative;
          min-height: 590px;
          overflow: hidden;
          background: #193b29;
        }

        .eco-auth-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12, 43, 27, .06) 15%, rgba(12, 43, 27, .78) 100%);
        }

        .eco-auth-photo img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .eco-auth-photo-copy {
          position: absolute;
          z-index: 2;
          left: 34px;
          right: 30px;
          bottom: 32px;
          color: #fff;
        }

        .eco-auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 15px;
          padding: 8px 11px;
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .eco-auth-photo-copy h3 {
          margin: 0;
          max-width: 360px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(30px, 3.2vw, 46px);
          line-height: .98;
          font-weight: 500;
          letter-spacing: -.04em;
        }

        .eco-auth-photo-copy p {
          margin: 14px 0 0;
          max-width: 330px;
          color: rgba(255,255,255,.78);
          font-size: 13px;
          line-height: 1.65;
        }

        .eco-auth-form {
          position: relative;
          padding: 42px 46px 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(235,241,225,.68));
        }

        .eco-auth-close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(25,59,41,.11);
          border-radius: 50%;
          background: rgba(255,255,255,.62);
          color: #193b29;
          cursor: pointer;
          transition: background .2s ease, transform .2s ease;
        }

        .eco-auth-close:hover {
          background: #fff;
          transform: translateY(-1px);
        }

        .eco-auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 24px;
          color: #193b29;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .eco-auth-brand-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #dfead2;
          color: #193b29;
        }

        .eco-auth-kicker {
          margin-bottom: 9px;
          color: #5c765d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .eco-auth-form h2 {
          margin: 0;
          color: #193b29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 4.2vw, 58px);
          line-height: .93;
          font-weight: 500;
          letter-spacing: -.055em;
        }

        .eco-auth-form h2 em {
          color: #6e8b68;
          font-style: italic;
        }

        .eco-auth-sub {
          max-width: 430px;
          margin: 15px 0 24px;
          color: #657166;
          font-size: 13px;
          line-height: 1.65;
        }

        .eco-auth-fields {
          display: grid;
          gap: 12px;
        }

        .eco-auth-field {
          display: block;
          color: #536056;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .eco-auth-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 7px;
          padding: 0 14px;
          min-height: 48px;
          border: 1px solid rgba(25,59,41,.13);
          border-radius: 15px;
          background: rgba(255,255,255,.72);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.7);
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .eco-auth-input-wrap:focus-within {
          border-color: rgba(47,101,65,.55);
          background: rgba(255,255,255,.96);
          box-shadow: 0 0 0 4px rgba(112,145,102,.13), 0 8px 24px rgba(27,67,42,.07);
        }

        .eco-auth-input-wrap svg {
          flex: 0 0 auto;
          color: #6d8969;
        }

        .eco-auth-input-wrap input {
          width: 100%;
          min-width: 0;
          padding: 13px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #193b29;
          font: inherit;
          font-size: 13px;
          letter-spacing: 0;
          text-transform: none;
        }

        .eco-auth-input-wrap input::placeholder {
          color: #a0aaa0;
        }

        .eco-auth-eye {
          padding: 4px;
          border: 0;
          background: transparent;
          color: #718070;
          cursor: pointer;
        }

        .eco-auth-submit {
          width: 100%;
          min-height: 51px;
          margin-top: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 15px;
          background: #193b29;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(25,59,41,.18);
          transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .eco-auth-submit:hover:not(:disabled) {
          background: #245337;
          transform: translateY(-1px);
          box-shadow: 0 15px 30px rgba(25,59,41,.22);
        }

        .eco-auth-submit:disabled {
          opacity: .45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .eco-auth-switch {
          margin-top: 15px;
          padding: 5px;
          border: 0;
          background: transparent;
          color: #52705a;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .eco-auth-switch:hover { color: #193b29; }

        .eco-auth-note {
          margin-top: 18px;
          color: #879188;
          font-size: 10px;
          line-height: 1.5;
          text-align: center;
        }

        @media (max-width: 760px) {
          .eco-auth-overlay { padding: 14px; }
          .eco-auth-card {
            width: min(520px, 100%);
            grid-template-columns: 1fr;
            min-height: auto;
            border-radius: 24px;
          }
          .eco-auth-photo { min-height: 210px; max-height: 230px; }
          .eco-auth-photo-copy { left: 24px; right: 24px; bottom: 22px; }
          .eco-auth-photo-copy h3 { font-size: 32px; }
          .eco-auth-photo-copy p { display: none; }
          .eco-auth-form { padding: 32px 25px 28px; }
        }

        @media (max-width: 420px) {
          .eco-auth-overlay { padding: 8px; }
          .eco-auth-form { padding: 29px 18px 23px; }
          .eco-auth-form h2 { font-size: 42px; }
          .eco-auth-photo { min-height: 180px; }
          .eco-auth-close { top: 12px; right: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .eco-auth-close,
          .eco-auth-input-wrap,
          .eco-auth-submit { transition: none; }
        }
      `}</style>

      <div className="eco-auth-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="eco-auth-photo">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85"
            alt="Students sharing ideas on campus"
          />
          <div className="eco-auth-photo-copy">
            <div className="eco-auth-badge">
              <Recycle size={14} />
              Campus circular economy
            </div>
            <h3>Keep useful things in use.</h3>
            <p>One account connects you to students, items and opportunities to circulate what already exists.</p>
          </div>
        </div>

        <div className="eco-auth-form">
          <button className="eco-auth-close" onClick={close} aria-label="Close">
            <X size={18} />
          </button>

          <div className="eco-auth-brand">
            <span className="eco-auth-brand-mark"><Recycle size={18} /></span>
            EcoLoop
          </div>

          <div className="eco-auth-kicker">{isRegister ? "Create your account" : "Welcome back"}</div>
          <h2>
            {isRegister ? "Join the" : "Welcome"}
            <br />
            <em>{isRegister ? "campus loop." : "back."}</em>
          </h2>

          <p className="eco-auth-sub">
            {isRegister
              ? "Create your student account and start circulating useful things across campus."
              : "Sign in to list items, request products and track your campus impact."}
          </p>

          <div className="eco-auth-fields">
            {isRegister && (
              <label className="eco-auth-field">
                Full name
                <span className="eco-auth-input-wrap">
                  <Users size={17} />
                  <input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Sibnarayan Samanta"
                    autoComplete="name"
                  />
                </span>
              </label>
            )}

            {isRegister && (
              <label className="eco-auth-field">
                College / Campus
                <span className="eco-auth-input-wrap">
                  <GraduationCap size={17} />
                  <input
                    value={form.college}
                    onChange={update("college")}
                    placeholder="Your college name"
                    autoComplete="organization"
                  />
                </span>
              </label>
            )}

            <label className="eco-auth-field">
              Email address
              <span className="eco-auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="eco-auth-field">
              Password
              <span className="eco-auth-input-wrap">
                <Leaf size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Minimum 6 characters"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSubmit();
                  }}
                />
                <button
                  type="button"
                  className="eco-auth-eye"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
          </div>

          <button
            className="eco-auth-submit"
            disabled={!valid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            {!submitting && <ArrowRight size={17} />}
          </button>

          <button className="eco-auth-switch" onClick={switchMode}>
            {isRegister
              ? "Already have an account? Sign in"
              : "New to EcoLoop? Create an account"}
          </button>

          <div className="eco-auth-note">
            Your account is used only to connect listings, requests and campus reuse activity.
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesView({ conversations, openChat }) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <div className="section-kicker">MESSAGES</div>
          <h1>Talk before the<br /><em>handover.</em></h1>
          <p>Ask about condition, price, exchange details, or the best campus handover point.</p>
        </div>
        <div className="impact-badge"><MessageCircle size={18} /><strong>Private chat</strong><span>Buyer ↔ seller</span></div>
      </section>

      <section className="section">
        <SectionHeading kicker="YOUR CONVERSATIONS" title={<>Keep the <em>loop talking.</em></>} text="Your conversations stay linked to the item being exchanged." />
        {conversations.length === 0 ? (
          <div className="empty-market">
            <div><MessageCircle size={25} /></div>
            <h3>No conversations yet</h3>
            <p>Open a marketplace item and choose “Chat seller” to start a conversation.</p>
            <button className="button-primary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Start from Marketplace</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            {conversations.map((conversation, index) => {
              const item = conversation.listing;
              const person = conversation.otherUser || conversation.user;
              if (!item || !person) return null;
              return (
                <button key={conversation.key || `${item._id}-${person._id}-${index}`} type="button" onClick={() => openChat(item, person)} style={{ width: "100%", textAlign: "left", border: "1px solid rgba(23,61,45,.12)", background: "rgba(255,255,255,.76)", borderRadius: 22, padding: 16, display: "grid", gridTemplateColumns: "56px 1fr auto", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 12px 35px rgba(23,61,45,.06)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 17, overflow: "hidden", background: "#e5f0df", display: "grid", placeItems: "center", fontWeight: 800, color: "#27402d" }}>
                    {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (person.name || "S")[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", opacity: .58, fontWeight: 800 }}>{item.title}</div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginTop: 3 }}>{person.name || "Student"}</div>
                    <div style={{ opacity: .65, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conversation.lastMessage || "Open conversation"}</div>
                  </div>
                  {conversation.unreadCount > 0 && <span style={{ minWidth: 24, height: 24, padding: "0 7px", borderRadius: 999, background: "#27402d", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{conversation.unreadCount}</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

function ChatModal({ listing, partner, close, refreshConversations, flash }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const listingId = listing?._id || listing?.id;
  const partnerId = partner?._id || partner?.id;

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("ecoloop_user") || "null"); }
    catch { return null; }
  })();
  const currentUserId = currentUser?.id || currentUser?._id;

  const loadMessages = async () => {
    if (!listingId || !partnerId) return;
    try {
      const data = await api.messages(listingId, partnerId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Chat:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = window.setInterval(loadMessages, 3000);
    return () => window.clearInterval(interval);
  }, [listingId, partnerId]);

  const send = async () => {
    const clean = text.trim();
    if (!clean || sending) return;
    try {
      setSending(true);
      await api.sendMessage({ listingId, receiverId: partnerId, message: clean });
      setText("");
      await loadMessages();
      await refreshConversations();
    } catch (error) {
      flash(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,30,23,.38)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 24 }} onMouseDown={close}>
      <div onMouseDown={(event) => event.stopPropagation()} style={{ width: "min(430px, 100%)", height: "min(650px, 90vh)", background: "#f8f7f1", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.25)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px", background: "#27402d", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,.13)", display: "grid", placeItems: "center", fontWeight: 800 }}>{(partner?.name || "S")[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}><strong style={{ display: "block", fontSize: 15 }}>{partner?.name || "Campus student"}</strong><span style={{ display: "block", fontSize: 11, opacity: .72, marginTop: 3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{listing?.title || "EcoLoop item"}</span></div>
          <button type="button" onClick={close} style={{ width: 38, height: 38, border: 0, borderRadius: 12, background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={19} /></button>
        </div>

        <div style={{ padding: "12px 18px", borderBottom: "1px solid #deded5", background: "#fff", fontSize: 12, color: "#687068" }}>💬 Chat about: <strong style={{ color: "#26362a" }}>{listing?.title}</strong></div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
          {loading ? (
            <div style={{ textAlign: "center", marginTop: 40, color: "#727970" }}>Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 55, color: "#747b73", padding: 20 }}><MessageCircle size={34} style={{ opacity: .45, marginBottom: 10 }} /><div style={{ fontWeight: 700, color: "#364338" }}>Start the conversation</div><p style={{ fontSize: 12, lineHeight: 1.5 }}>Ask about availability, condition or handover.</p></div>
          ) : (
            messages.map((message) => {
              const senderId = message.sender?._id || message.sender?.id || message.sender;
              const mine = String(senderId) === String(currentUserId);
              return (
                <div key={message._id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: mine ? "#27402d" : "#fff", color: mine ? "#fff" : "#273229", border: mine ? "none" : "1px solid #deded5", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.message}</div>
                    <div style={{ marginTop: 5, fontSize: 9, opacity: .6, textAlign: "right" }}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: 14, borderTop: "1px solid #deded5", background: "#fff", display: "flex", gap: 8 }}>
          <textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={handleKeyDown} rows={1} maxLength={1000} placeholder="Write a message..." style={{ flex: 1, resize: "none", border: "1px solid #d7dbd2", borderRadius: 14, padding: "11px 13px", outline: "none", fontFamily: "inherit", fontSize: 13, background: "#f7f7f2" }} />
          <button type="button" onClick={send} disabled={!text.trim() || sending} style={{ width: 45, height: 45, border: 0, borderRadius: 14, background: text.trim() ? "#27402d" : "#dce1d8", color: "#fff", cursor: text.trim() ? "pointer" : "not-allowed", display: "grid", placeItems: "center" }}><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}

function RequestsView({
  requests,
  respondRequest,
}) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <div className="section-kicker">
            REQUEST CENTER
          </div>

          <h1>
            Keep every handover
            <br />
            <em>moving forward.</em>
          </h1>

          <p>
            Manage requests for your
            listings and track items
            you've requested.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          kicker="INCOMING"
          title={
            <>
              Students
              <em> requesting.</em>
            </>
          }
          text="Accept or decline requests for your items."
        />

        {requests.incoming.length === 0 ? (
          <div className="empty-market">
            <div>
              <Users size={25} />
            </div>

            <h3>
              No incoming requests
            </h3>

            <p>
              Requests for your
              listings will appear
              here.
            </p>
          </div>
        ) : (
          <div className="market-grid">
            {requests.incoming.map(
              (request) => (
                <RequestCard
                  key={
                    request._id
                  }
                  request={
                    request
                  }
                  incoming
                  respondRequest={
                    respondRequest
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      <section className="section">
        <SectionHeading
          kicker="OUTGOING"
          title={
            <>
              Your
              <em> requests.</em>
            </>
          }
          text="Track the items you want to receive."
        />

        {requests.outgoing.length ===
        0 ? (
          <div className="empty-market">
            <div>
              <Package size={25} />
            </div>

            <h3>
              No requests yet
            </h3>

            <p>
              Explore the marketplace
              and request something
              useful.
            </p>
          </div>
        ) : (
          <div className="market-grid">
            {requests.outgoing.map(
              (request) => (
                <RequestCard
                  key={
                    request._id
                  }
                  request={
                    request
                  }
                  respondRequest={
                    respondRequest
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
function RequestCard({ request, incoming = false, respondRequest }) {
  const listing = request.listing;

  if (!listing) return null;

  const status = request.status;
  const ownerName = request.owner?.name || "Student";
  const requesterName = request.requester?.name || "Student";

  return (
    <article className="listing-card">
      <div className="card-art-wrap">
        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <ItemArt category={listing.category} tone="mint" />
        )}

        <span className="condition-badge">{listing.condition}</span>
      </div>

      <div className="card-content">
        <div className="card-category">
          {incoming ? `From ${requesterName}` : `Owner: ${ownerName}`}
        </div>

        <h3>{listing.title}</h3>
        <p>{listing.description || "No description provided."}</p>

        <div style={{ marginTop: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12 }}>
          Status: <span>{status}</span>
        </div>

        {incoming && status === "pending" && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              className="button-primary"
              style={{ flex: 1 }}
              onClick={() => respondRequest(request._id, "accepted")}
            >
              <Check size={15} />
              Accept
            </button>
            <button
              className="button-secondary"
              style={{ flex: 1 }}
              onClick={() => respondRequest(request._id, "declined")}
            >
              Decline
            </button>
          </div>
        )}

        {!incoming && status === "accepted" && (
          <button
            className="card-request"
            onClick={() => respondRequest(request._id, "completed")}
          >
            <Check size={15} />
            Complete handover
            <ArrowUpRight size={15} />
          </button>
        )}

        {status === "completed" && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "#e8f3e7", display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
            <Recycle size={17} />
            Item reused successfully
          </div>
        )}
      </div>
    </article>
  );
}

function MyItems({
  listings,
  logout,
}) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <div className="section-kicker">
            MY ECOLOOP
          </div>

          <h1>
            Your items.
            <br />
            <em>Your impact.</em>
          </h1>

          <p>
            Everything you've put
            into the campus loop.
          </p>
        </div>

        <button
          className="button-secondary"
          onClick={logout}
        >
          Sign out
        </button>
      </section>

      <section className="section">
        <SectionHeading
          kicker="YOUR LISTINGS"
          title={
            <>
              Items you've
              <em> passed on.</em>
            </>
          }
        />

        {listings.length === 0 ? (
          <div className="empty-market">
            <div>
              <Package size={25} />
            </div>

            <h3>
              No listings yet
            </h3>

            <p>
              List your first unused
              item and start the loop.
            </p>
          </div>
        ) : (
          <div className="market-grid">
            {listings.map((item) => (
              <article
                className="listing-card"
                key={item._id}
              >
                <div className="card-art-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <ItemArt
                      category={item.category}
                      tone="mint"
                    />
                  )}

                  <span className="condition-badge">
                    {item.condition}
                  </span>
                </div>

                <div className="card-content">
                  <div className="card-category">
                    {item.mode}
                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                  <div
                    style={{
                      marginTop: 12,
                      fontWeight: 700,
                    }}
                  >
                    Status:{" "}
                    {item.status}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand"><span className="logo-mark"><Recycle size={18} /></span><strong>EcoLoop</strong><span>·</span><span>Campus Circular Economy</span></div>
      <span>Built to keep useful things in use.</span>
    </footer>
  );
}
