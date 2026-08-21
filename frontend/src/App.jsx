import { createContext, useContext, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import PatientProfilePage from "./pages/PatientProfilePage";
import ScreeningPage from "./pages/ScreeningPage";
import RiskResultPage from "./pages/RiskResultPage";
import ReferralPage from "./pages/ReferralPage";
import AppointmentPage from "./pages/AppointmentPage";

const copy = {
    en: {
        worker: "Sunita Sharma",
        place: "Rampur Ward 4",
        online: "Online · synced",
        offline: "You are offline. Data is being saved and will sync when internet returns.",
        loginTitle: "AshaCare",
        loginSubtitle: "Your healthcare field-work assistant.",
        phone: "Phone number",
        pin: "PIN / password",
        signIn: "Sign in",
        signInTitle: "Create your AshaCare access",
        loginTitleExisting: "Log in to your account",
        fullName: "Full name",
        ashaIdLabel: "ASHA ID",
        villageLabel: "Village / ward",
        districtLabel: "District",
        createPin: "Create PIN",
        existingPrompt: "Already signed in before?",
        newPrompt: "New ASHA worker?",
        showLogin: "Log in with phone and PIN",
        showSignIn: "Create access",
        login: "Login",
        forgot: "Forgot PIN?",
        already: "Already logged in? Continue to dashboard",
        language: "Language",
        home: "Home",
        visits: "Visits",
        schemes: "Schemes",
        followups: "Follow-ups",
        rewards: "Rewards",
        profile: "Profile",
        greeting: "Good morning, Sunita",
        newVisit: "New Visit",
        myRegistrations: "My Registrations",
        todayTasks: "Today's tasks",
        needsAction: "Needs action",
        open: "Open",
        stats: ["Today's visits", "Pending follow-ups", "Total points"],
        taskRows: [
            ["3 visits today", "Start with ANC visit near PHC road"],
            ["2 follow-ups due", "One BP medicine check is overdue"],
            ["1 high-risk case", "Visit PHC today for Meena Devi"],
        ],
        visitTitle: "New Visit",
        step: "Step 1 of 3",
        visitTypes: [
            ["Pregnant Woman Visit", "ANC check, danger signs, JSY support"],
            ["NCD Check", "BP, diabetes, medicine follow-up"],
            ["TB Symptom Check", "Cough, fever, referral support"],
            ["Other / General", "Routine visit or family concern"],
        ],
        search: "Search beneficiary",
        addBeneficiary: "Add New Beneficiary",
        symptoms: "Symptoms & vitals",
        bpSys: "BP systolic",
        bpDia: "BP diastolic",
        sugar: "Blood sugar",
        weight: "Weight (kg)",
        danger: "Severe headache or swelling reported",
        back: "Back",
        next: "Next",
        riskBadge: "High risk · urgent",
        highRisk: "HIGH RISK",
        riskCommand: "Visit PHC today.",
        riskActions: [
            "Call PHC nurse before travel.",
            "Carry MCP card and BP notes.",
            "Explain warning signs to family.",
        ],
        playAdvice: "Play Advice",
        referral: "Generate Referral",
        schemesTitle: "Government schemes",
        eligible: "Eligible",
        schemeItems: [
            ["JSY", "Cash support for institutional delivery", "Pregnancy"],
            ["JSSK", "Free delivery, medicines, diagnostics, transport", "Mother & child"],
            ["PMMVY", "Maternity benefit for eligible women", "Pregnancy"],
            ["NCD Clinic", "BP and diabetes care at PHC", "NCD"],
            ["TB Programme", "Testing, treatment and nutrition support", "TB"],
        ],
        viewDetails: "View Details",
        registerPmmvy: "Register for PMMVY",
        patientName: "Patient name",
        idLast4: "Aadhaar / ID last 4",
        declaration: "I confirm documents were checked with the patient.",
        submitRegistration: "Submit Registration",
        success: "Registration submitted · Ref ASHA-PMMVY-2408",
        appointment: "Appointment",
        department: "Department: Obstetrics · Ref PHC-8821",
        map: "View on Map",
        informed: "Mark as Informed",
        filters: ["All", "Week", "Overdue"],
        followRows: [
            ["Saraswati Bai", "Pregnancy", "Today", "Overdue"],
            ["Lata Kumari", "NCD Check", "Tomorrow", "Pending"],
            ["Rekha Singh", "TB Referral", "24 Aug", "Completed"],
        ],
        submitFollow: "Submit follow-up",
        notes: "Notes",
        notesText: "Patient informed and travel arranged",
        submitFollowButton: "Submit Follow-up",
        followSuccess: "Follow-up submitted, pending verification.",
        totalPoints: "Total points",
        level: "Level 3 · 260 points to next reward",
        rewardRows: [
            ["Pregnancy registrations", "+420 pts"],
            ["NCD follow-ups", "+310 pts"],
            ["TB referrals completed", "+180 pts"],
        ],
        ashaId: "ASHA ID: ASH-RMP-104 · Block Rampur",
        settings: [
            "Language",
            "Text Size: Medium",
            "High Contrast",
            "Notifications",
            "Change PIN",
            "Help & Support",
            "About AshaCare",
            "Logout",
        ],
    },
    hi: {
        worker: "सुनीता शर्मा",
        place: "रामपुर वार्ड 4",
        online: "ऑनलाइन · सिंक हो गया",
        offline: "आप ऑफलाइन हैं। डेटा सेव हो रहा है। इंटरनेट आने पर सिंक होगा।",
        loginTitle: "आशाCare",
        loginSubtitle: "आपकी स्वास्थ्य फील्ड-वर्क सहायक।",
        phone: "फोन नंबर",
        pin: "पिन / पासवर्ड",
        login: "लॉगिन",
        forgot: "पिन भूल गए?",
        already: "पहले से लॉगिन हैं? डैशबोर्ड खोलें",
        language: "भाषा",
        home: "होम",
        visits: "विजिट",
        schemes: "योजनाएँ",
        followups: "फॉलो-अप",
        rewards: "पुरस्कार",
        profile: "प्रोफाइल",
        greeting: "सुप्रभात, सुनीता",
        newVisit: "नई विजिट",
        myRegistrations: "मेरे पंजीकरण",
        todayTasks: "आज के काम",
        needsAction: "कार्य जरूरी",
        open: "खोलें",
        stats: ["आज की विजिट", "बाकी फॉलो-अप", "कुल अंक"],
        taskRows: [
            ["आज 3 विजिट", "PHC रोड के पास ANC विजिट से शुरू करें"],
            ["2 फॉलो-अप बाकी", "एक BP दवा जांच देर से है"],
            ["1 उच्च जोखिम केस", "मीना देवी को आज PHC ले जाएँ"],
        ],
        visitTitle: "नई विजिट",
        step: "चरण 1 / 3",
        visitTypes: [
            ["गर्भवती महिला विजिट", "ANC जांच, खतरे के संकेत, JSY सहायता"],
            ["NCD जांच", "BP, डायबिटीज, दवा फॉलो-अप"],
            ["TB लक्षण जांच", "खांसी, बुखार, रेफरल सहायता"],
            ["अन्य / सामान्य", "रूटीन विजिट या परिवार की चिंता"],
        ],
        search: "लाभार्थी खोजें",
        addBeneficiary: "नया लाभार्थी जोड़ें",
        symptoms: "लक्षण और वाइटल्स",
        bpSys: "BP सिस्टोलिक",
        bpDia: "BP डायस्टोलिक",
        sugar: "ब्लड शुगर",
        weight: "वजन (किलो)",
        danger: "तेज सिरदर्द या सूजन बताई गई",
        back: "वापस",
        next: "आगे",
        riskBadge: "उच्च जोखिम · तुरंत",
        highRisk: "उच्च जोखिम",
        riskCommand: "आज PHC जाएँ।",
        riskActions: [
            "यात्रा से पहले PHC नर्स को कॉल करें।",
            "MCP कार्ड और BP नोट साथ रखें।",
            "परिवार को चेतावनी संकेत समझाएँ।",
        ],
        playAdvice: "सलाह सुनें",
        referral: "रेफरल बनाएं",
        schemesTitle: "सरकारी योजनाएँ",
        eligible: "पात्र",
        schemeItems: [
            ["JSY", "संस्थागत प्रसव के लिए नकद सहायता", "गर्भावस्था"],
            ["JSSK", "मुफ्त प्रसव, दवा, जांच और परिवहन", "माँ और बच्चा"],
            ["PMMVY", "पात्र महिलाओं के लिए मातृत्व लाभ", "गर्भावस्था"],
            ["NCD क्लिनिक", "PHC में BP और डायबिटीज देखभाल", "NCD"],
            ["TB कार्यक्रम", "जांच, इलाज और पोषण सहायता", "TB"],
        ],
        viewDetails: "विवरण देखें",
        registerPmmvy: "PMMVY पंजीकरण",
        patientName: "मरीज का नाम",
        idLast4: "आधार / ID अंतिम 4 अंक",
        declaration: "मैं पुष्टि करती हूँ कि दस्तावेज मरीज के साथ जांचे गए।",
        submitRegistration: "पंजीकरण जमा करें",
        success: "पंजीकरण जमा हुआ · Ref ASHA-PMMVY-2408",
        appointment: "अपॉइंटमेंट",
        department: "विभाग: प्रसूति · Ref PHC-8821",
        map: "मैप देखें",
        informed: "सूचित किया",
        filters: ["सभी", "सप्ताह", "देर से"],
        followRows: [
            ["सरस्वती बाई", "गर्भावस्था", "आज", "देर से"],
            ["लता कुमारी", "NCD जांच", "कल", "बाकी"],
            ["रेखा सिंह", "TB रेफरल", "24 अगस्त", "पूरा"],
        ],
        submitFollow: "फॉलो-अप जमा करें",
        notes: "नोट्स",
        notesText: "मरीज को सूचना दी और यात्रा तय हुई",
        submitFollowButton: "फॉलो-अप जमा करें",
        followSuccess: "फॉलो-अप जमा हुआ, सत्यापन बाकी है।",
        totalPoints: "कुल अंक",
        level: "लेवल 3 · अगले पुरस्कार तक 260 अंक",
        rewardRows: [
            ["गर्भावस्था पंजीकरण", "+420 अंक"],
            ["NCD फॉलो-अप", "+310 अंक"],
            ["TB रेफरल पूरे", "+180 अंक"],
        ],
        ashaId: "ASHA ID: ASH-RMP-104 · ब्लॉक रामपुर",
        settings: [
            "भाषा",
            "टेक्स्ट आकार: मध्यम",
            "हाई कॉन्ट्रास्ट",
            "नोटिफिकेशन",
            "पिन बदलें",
            "सहायता",
            "आशाCare के बारे में",
            "लॉगआउट",
        ],
    },
};

const LanguageContext = createContext(null);

const useLanguage = () => useContext(LanguageContext);

const Icon = ({ name }) => {
    const icons = {
        home: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z",
        visits: "M7 3h10v18H7z M9.5 8h5 M9.5 12h5 M9.5 16h3",
        schemes: "M5 5h14v14H5z M8 9h8 M8 13h8 M8 17h5",
        followups: "M12 5v7l4 2 M21 12a9 9 0 1 1-3-6.7",
        rewards: "M8 4h8v4a4 4 0 0 1-8 0z M6 4H4a3 3 0 0 0 3 3 M18 4h2a3 3 0 0 1-3 3 M12 12v5 M9 21h6",
        profile: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z M4 21a8 8 0 0 1 16 0",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={icons[name]} />
        </svg>
    );
};

const StatusPill = ({ tone = "blue", children }) => (
    <span className={`status-pill ${tone}`}>{children}</span>
);

const Field = ({ label, value, type = "text" }) => (
    <label className="field">
        <span>{label}</span>
        <input type={type} defaultValue={value} />
    </label>
);

const LanguageToggle = () => {
    const { lang, setLang, t } = useLanguage();

    return (
        <button
            className="language-toggle"
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            aria-label={t.language}
        >
            {lang === "en" ? "EN | हिं" : "हिं | EN"}
        </button>
    );
};

const AppShell = ({ children }) => {
    const { t } = useLanguage();

    return (
        <main className="app-canvas">
            <section className="phone-shell">
                <header className="app-header">
                    <div className="brand-row">
                        <div className="logo-mark">A</div>
                        <div>
                            <p className="brand-name">AshaCare</p>
                            <p className="place-text">{t.worker} · {t.place}</p>
                        </div>
                        <NavLink className="avatar" to="/profile" aria-label={t.profile}>
                            SS
                        </NavLink>
                    </div>
                    <div className="utility-row">
                        <StatusPill tone="green">{t.online}</StatusPill>
                        <LanguageToggle />
                    </div>
                    <p className="offline-note">{t.offline}</p>
                </header>
                {children}
            </section>
            <BottomNav />
        </main>
    );
};

const BottomNav = () => {
    const { t } = useLanguage();
    const items = [
        ["/home", "home", t.home],
        ["/visits", "visits", t.visits],
        ["/schemes", "schemes", t.schemes],
        ["/follow-ups", "followups", t.followups],
        ["/rewards", "rewards", t.rewards],
        ["/profile", "profile", t.profile],
    ];

    return (
        <nav className="bottom-nav" aria-label="Primary">
            {items.map(([path, icon, label]) => (
                <NavLink key={path} to={path} className="nav-item">
                    <Icon name={icon} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [authMode, setAuthMode] = useState("signin");
    const enter = () => {
        localStorage.setItem("ashaCareLoggedIn", "true");
        navigate("/home");
    };

    return (
        <main className="login-canvas">
            <section className="login-card">
                <div className="login-top">
                    <div className="logo-mark">A</div>
                    <LanguageToggle />
                </div>
                <p className="brand-name">{t.loginTitle}</p>
                <h1>
                    {authMode === "signin"
                        ? t.signInTitle || "Create your AshaCare access"
                        : t.loginTitleExisting || "Log in to your account"}
                </h1>
                <div className="auth-switch" role="tablist" aria-label="Authentication mode">
                    <button
                        className={authMode === "signin" ? "active" : ""}
                        type="button"
                        onClick={() => setAuthMode("signin")}
                    >
                        {t.signIn || "Sign in"}
                    </button>
                    <button
                        className={authMode === "login" ? "active" : ""}
                        type="button"
                        onClick={() => setAuthMode("login")}
                    >
                        {t.login}
                    </button>
                </div>
                <form className="login-form" onSubmit={(event) => { event.preventDefault(); enter(); }}>
                    {authMode === "signin" ? (
                        <>
                            <Field label={t.fullName || "Full name"} value="Sunita Sharma" />
                            <Field label={t.phone} value="+91 98765 43210" type="tel" />
                            <Field label={t.ashaIdLabel || "ASHA ID"} value="ASH-RMP-104" />
                            <Field label={t.villageLabel || "Village / ward"} value="Rampur Ward 4" />
                            <Field label={t.districtLabel || "District"} value="Sitapur" />
                            <Field label={t.createPin || "Create PIN"} value="1234" type="password" />
                        </>
                    ) : (
                        <>
                            <Field label={t.phone} value="+91 98765 43210" type="tel" />
                            <Field label={t.pin} value="1234" type="password" />
                        </>
                    )}
                    <button className="primary-action burgundy" type="submit">
                        {authMode === "signin" ? t.signIn || "Sign in" : t.login}
                    </button>
                    {authMode === "login" && <button className="link-button" type="button">{t.forgot}</button>}
                </form>
                <button
                    className="already-button"
                    type="button"
                    onClick={() => setAuthMode(authMode === "signin" ? "login" : "signin")}
                >
                    <span>{authMode === "signin" ? t.existingPrompt || "Already signed in before?" : t.newPrompt || "New ASHA worker?"}</span>
                    {authMode === "signin" ? t.showLogin || "Log in with phone and PIN" : t.showSignIn || "Create access"}
                </button>
            </section>
        </main>
    );
};

const RequireLogin = ({ children }) => {
    const isLoggedIn = localStorage.getItem("ashaCareLoggedIn") === "true";
    return isLoggedIn ? children : <Navigate to="/" replace />;
};

const HomePage = () => {
    const { t } = useLanguage();
    const statValues = ["12", "5", "1,840"];
    const statNotes = ["3 completed", "2 overdue", "+90 this week"];

    return (
        <AppShell>
            <section className="welcome-panel">
                <p>{t.greeting}</p>
                <h1>{t.loginSubtitle}</h1>
                <div className="quick-actions">
                    <NavLink to="/visits" className="primary-action blue">{t.newVisit}</NavLink>
                    <NavLink to="/follow-ups" className="primary-action green">{t.followups}</NavLink>
                </div>
            </section>
            <section className="stats-grid" aria-label="Dashboard summary">
                {t.stats.map((label, index) => (
                    <article className="stat-card" key={label}>
                        <p>{label}</p>
                        <strong>{statValues[index]}</strong>
                        <span>{statNotes[index]}</span>
                    </article>
                ))}
            </section>
            <section className="task-panel">
                <div className="section-title">
                    <h2>{t.todayTasks}</h2>
                    <StatusPill tone="amber">{t.needsAction}</StatusPill>
                </div>
                {t.taskRows.map(([title, text], index) => (
                    <div className="task-row" key={title}>
                        <span className={`task-dot ${["blue", "amber", "red"][index]}`} />
                        <div>
                            <strong>{title}</strong>
                            <p>{text}</p>
                        </div>
                        <button type="button">{t.open}</button>
                    </div>
                ))}
            </section>
        </AppShell>
    );
};

const VisitsPage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="screen-section">
                <div className="section-title">
                    <h1>{t.visitTitle}</h1>
                    <StatusPill>{t.step}</StatusPill>
                </div>
                <div className="visit-grid">
                    {t.visitTypes.map(([title, text]) => (
                        <button className="visit-type" type="button" key={title}>
                            <strong>{title}</strong>
                            <span>{text}</span>
                        </button>
                    ))}
                </div>
                <div className="search-panel">
                    <Field label={t.search} value="Meena" />
                    {[
                        ["Meena Devi", "24 years", "Rampur Tola", "Pregnancy"],
                        ["Rafiq Khan", "52 years", "Ward 7", "NCD follow-up"],
                    ].map(([name, age, village, tag]) => (
                        <button className="beneficiary-row" type="button" key={name}>
                            <div>
                                <strong>{name}</strong>
                                <p>{age} · {village}</p>
                            </div>
                            <StatusPill tone="green">{tag}</StatusPill>
                        </button>
                    ))}
                    <button className="secondary-action" type="button">{t.addBeneficiary}</button>
                </div>
                <form className="screening-card">
                    <div className="progress-track"><span style={{ width: "66%" }} /></div>
                    <h2>{t.symptoms}</h2>
                    <div className="field-grid">
                        <Field label={t.bpSys} value="152" type="number" />
                        <Field label={t.bpDia} value="96" type="number" />
                        <Field label={t.sugar} value="188" type="number" />
                        <Field label={t.weight} value="58" type="number" />
                    </div>
                    <label className="check-row"><input type="checkbox" defaultChecked />{t.danger}</label>
                    <div className="button-row">
                        <button className="secondary-action" type="button">{t.back}</button>
                        <NavLink className="primary-action green" to="/risk">{t.next}</NavLink>
                    </div>
                </form>
            </section>
        </AppShell>
    );
};

const RiskPage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="risk-screen">
                <StatusPill tone="red">{t.riskBadge}</StatusPill>
                <h1>{t.highRisk}</h1>
                <p className="risk-command">{t.riskCommand}</p>
                <ul>{t.riskActions.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="button-row">
                    <button className="secondary-action" type="button">{t.playAdvice}</button>
                    <NavLink className="primary-action blue" to="/schemes">{t.referral}</NavLink>
                </div>
            </section>
        </AppShell>
    );
};

const SchemesPage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="screen-section">
                <div className="section-title">
                    <h1>{t.schemesTitle}</h1>
                    <StatusPill tone="green">{t.eligible}</StatusPill>
                </div>
                <div className="scheme-list">
                    {t.schemeItems.map(([name, text, tag]) => (
                        <article className="scheme-card" key={name}>
                            <div>
                                <strong>{name}</strong>
                                <p>{text}</p>
                            </div>
                            <button type="button">{t.viewDetails}</button>
                            <span>{tag}</span>
                        </article>
                    ))}
                </div>
                <form className="registration-card">
                    <h2>{t.registerPmmvy}</h2>
                    <Field label={t.patientName} value="Meena Devi" />
                    <Field label={t.idLast4} value="4832" />
                    <label className="check-row"><input type="checkbox" defaultChecked />{t.declaration}</label>
                    <button className="primary-action green" type="button">{t.submitRegistration}</button>
                    <div className="success-box">{t.success}</div>
                </form>
            </section>
            <section className="appointment-panel">
                <p>{t.appointment}</p>
                <h2>Rampur PHC</h2>
                <div className="appointment-time">23 Aug · 10:30 AM</div>
                <span>{t.department}</span>
                <div className="button-row">
                    <button className="secondary-action" type="button">{t.map}</button>
                    <button className="primary-action blue" type="button">{t.informed}</button>
                </div>
            </section>
        </AppShell>
    );
};

const FollowUpsPage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="screen-section">
                <div className="section-title">
                    <h1>{t.followups}</h1>
                    <div className="filter-tabs">
                        {t.filters.map((item) => <button type="button" key={item}>{item}</button>)}
                    </div>
                </div>
                {t.followRows.map(([name, type, due, status]) => (
                    <article className="follow-row" key={name}>
                        <div>
                            <strong>{name}</strong>
                            <p>{type} · Rampur · {due}</p>
                        </div>
                        <StatusPill tone={status.includes("Completed") || status.includes("पूरा") ? "green" : status.includes("Overdue") || status.includes("देर") ? "red" : "amber"}>
                            {status}
                        </StatusPill>
                    </article>
                ))}
                <div className="proof-panel">
                    <h2>{t.submitFollow}</h2>
                    <Field label={t.notes} value={t.notesText} />
                    <button className="primary-action green" type="button">{t.submitFollowButton}</button>
                    <p>{t.followSuccess}</p>
                </div>
            </section>
        </AppShell>
    );
};

const RewardsPage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="rewards-panel">
                <p>{t.totalPoints}</p>
                <h1>1,840</h1>
                <div className="progress-track"><span style={{ width: "74%" }} /></div>
                <span>{t.level}</span>
                {t.rewardRows.map(([label, value]) => (
                    <div className="reward-row" key={label}>
                        <p>{label}</p>
                        <strong>{value}</strong>
                    </div>
                ))}
            </section>
        </AppShell>
    );
};

const ProfilePage = () => {
    const { t } = useLanguage();

    return (
        <AppShell>
            <section className="profile-panel">
                <div className="profile-head">
                    <div className="profile-photo">SS</div>
                    <div>
                        <h1>{t.worker}</h1>
                        <p>{t.ashaId}</p>
                    </div>
                </div>
                {t.settings.map((item) => (
                    <button className="setting-row" type="button" key={item}>{item}</button>
                ))}
            </section>
        </AppShell>
    );
};

const App = () => {
    const [lang, setLang] = useState("en");
    const languageValue = useMemo(() => ({ lang, setLang, t: copy[lang] }), [lang]);

    return (
        <LanguageContext.Provider value={languageValue}>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<RequireLogin><HomePage /></RequireLogin>} />
                <Route path="/visits" element={<RequireLogin><VisitsPage /></RequireLogin>} />
                <Route path="/risk" element={<RequireLogin><RiskPage /></RequireLogin>} />
                <Route path="/schemes" element={<RequireLogin><SchemesPage /></RequireLogin>} />
                <Route path="/follow-ups" element={<RequireLogin><FollowUpsPage /></RequireLogin>} />
                <Route path="/rewards" element={<RequireLogin><RewardsPage /></RequireLogin>} />
                <Route path="/profile" element={<RequireLogin><ProfilePage /></RequireLogin>} />
                <Route path="/patients/:patientId" element={<PatientProfilePage />} />
                <Route path="/cases/:caseId/screening" element={<ScreeningPage />} />
                <Route path="/cases/:caseId/risk" element={<RiskResultPage />} />
                <Route path="/cases/:caseId/referral" element={<ReferralPage />} />
                <Route path="/cases/:caseId/appointment" element={<AppointmentPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </LanguageContext.Provider>
    );
};

export default App;
