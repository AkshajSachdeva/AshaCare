import { createContext, useContext, useEffect, useMemo, useState } from "react";

const storageKey = "accessibilitySettings";

export const translations = {
    en: {
        home: "Home", schemes: "Schemes", profile: "Profile", patients: "Patients", rewards: "Rewards", logout: "Logout",
        accessibilitySettings: "Accessibility settings", language: "Language", textSize: "Text size", highContrast: "High contrast", increaseContrast: "Increase colour contrast.", on: "On", off: "Off", small: "Small", medium: "Medium", large: "Large",
        online: "Online", offline: "Offline", syncing: "Syncing data...", offlineMessage: "You are offline. Data is being saved and will sync when internet is available.",
        loginTagline: "Your community healthcare companion", phoneNumber: "Phone number", password: "Password / PIN", enterPin: "Enter your PIN", login: "Login", loggingIn: "Logging in...", loginError: "Please enter your phone number and PIN.", forgotPassword: "Forgot PIN/password? Contact your supervisor.", newToAshaCare: "New to AshaCare? See how it works",
        step: "Step", of: "of", continue: "Continue", getStarted: "Get Started", skip: "Skip", onboarding1Title: "Record patient visits easily", onboarding1Description: "Keep the important details from every patient visit in one clear place.", onboarding2Title: "Identify health risks", onboarding2Description: "Use simple screening information to understand when a patient needs attention.", onboarding3Title: "Connect patients with schemes and follow-ups", onboarding3Description: "Help patients access support and remember what needs to happen next.",
        homeTitle: "Care coordination, made simpler.", homeDescription: "Use the patient workflow to record care visits, and use schemes to help patients access support.", viewSchemes: "View Schemes", myProfile: "My Profile", patientWorkflow: "Patient workflow", patientWorkflowDescription: "The patient list and rewards dashboard are being integrated by the team. Existing patient and care-case links remain available when opened with their IDs.",
        patientSupport: "Patient support", governmentSchemes: "Government Schemes", schemesDescription: "Recommended support options for patients. Select a scheme to review its support and registration requirements.", loadingSchemes: "Loading recommended schemes...", noSchemes: "No schemes are recommended right now.", recommended: "Recommended", registered: "Registered", viewDetails: "View Details", backToSchemes: "Back to Schemes", schemeNotFound: "Scheme not found", schemeUnavailable: "This scheme is no longer available in the demo.", benefits: "Benefits", eligibility: "Eligibility", requiredDocuments: "Required documents", applicableCategories: "Applicable categories", registerForScheme: "Register for this Scheme", registrationStarted: "Registration started",
        schemeRegistration: "Scheme registration", backToDetails: "Back to scheme details", registerFor: "Register for", registrationDescription: "Complete the patient details and confirm the required documents.", patientName: "Patient name", age: "Age", villageArea: "Village / area", ifAvailable: "(if available)", healthCategory: "Health category / condition", contactNumber: "Contact number", documentsHelp: "Check each document that is available for this registration.", declaration: "I confirm that the patient information and document checklist are correct for this registration.", submitRegistration: "Submit Registration", registrationSuccess: "Registration submitted successfully", registrationRecorded: "Your frontend demo registration for {schemeName} has been recorded.", referenceNumber: "Reference number", registrationDate: "Registration date", registrationStatus: "Registration status", viewRegistration: "View Registration", registrationDetails: "Registration details",
        profileUnavailable: "Profile unavailable", profileUnavailableDescription: "Please log in to view your ASHA worker profile.", goToLogin: "Go to Login", workerAccount: "ASHA worker account", profileSettings: "Profile & Settings", communityWorker: "Community healthcare worker", email: "Email", ashaId: "ASHA ID", villageBlockDistrict: "Village / block / district", totalPoints: "Total points", notAvailable: "Not available", savedOnDevice: "These choices are saved on this device.", skipToContent: "Skip to main content", appFooter: "AshaCare helps ASHA workers coordinate community care.", patientListNote: "Patient list will be connected to the dashboard", rewardsNote: "Rewards will be connected when that page is ready",
    },
    hi: {
        home: "होम", schemes: "योजनाएँ", profile: "प्रोफ़ाइल", patients: "मरीज़", rewards: "रिवॉर्ड्स", logout: "लॉग आउट",
        accessibilitySettings: "सुलभता सेटिंग्स", language: "भाषा", textSize: "टेक्स्ट आकार", highContrast: "उच्च कंट्रास्ट", increaseContrast: "रंगों का कंट्रास्ट बढ़ाएँ।", on: "चालू", off: "बंद", small: "छोटा", medium: "मध्यम", large: "बड़ा",
        online: "ऑनलाइन", offline: "ऑफ़लाइन", syncing: "डेटा सिंक हो रहा है...", offlineMessage: "आप ऑफ़लाइन हैं। डेटा सहेजा जा रहा है और इंटरनेट उपलब्ध होने पर सिंक होगा।",
        loginTagline: "आपकी सामुदायिक स्वास्थ्य साथी", phoneNumber: "फ़ोन नंबर", password: "पासवर्ड / पिन", enterPin: "अपना पिन दर्ज करें", login: "लॉग इन", loggingIn: "लॉग इन हो रहा है...", loginError: "कृपया अपना फ़ोन नंबर और पिन दर्ज करें।", forgotPassword: "पिन/पासवर्ड भूल गए? अपने सुपरवाइज़र से संपर्क करें।", newToAshaCare: "AshaCare में नए हैं? जानें यह कैसे काम करता है",
        step: "चरण", of: "का", continue: "जारी रखें", getStarted: "शुरू करें", skip: "छोड़ें", onboarding1Title: "मरीज़ की मुलाकातें आसानी से दर्ज करें", onboarding1Description: "हर मरीज़ की मुलाकात की ज़रूरी जानकारी एक जगह रखें।", onboarding2Title: "स्वास्थ्य जोखिम पहचानें", onboarding2Description: "सरल स्क्रीनिंग जानकारी से समझें कि मरीज़ को कब ध्यान की ज़रूरत है।", onboarding3Title: "मरीज़ों को योजनाओं और फॉलो-अप से जोड़ें", onboarding3Description: "मरीज़ों को सहायता पाने और अगले कदम याद रखने में मदद करें।",
        homeTitle: "देखभाल समन्वय, अब और सरल।", homeDescription: "देखभाल यात्राएँ दर्ज करने के लिए मरीज़ कार्यप्रवाह और सहायता पाने के लिए योजनाओं का उपयोग करें।", viewSchemes: "योजनाएँ देखें", myProfile: "मेरी प्रोफ़ाइल", patientWorkflow: "मरीज़ कार्यप्रवाह", patientWorkflowDescription: "मरीज़ सूची और रिवॉर्ड्स डैशबोर्ड टीम द्वारा जोड़े जा रहे हैं। आईडी के साथ खोलने पर मौजूदा मरीज़ और केयर-केस लिंक उपलब्ध रहेंगे।",
        patientSupport: "मरीज़ सहायता", governmentSchemes: "सरकारी योजनाएँ", schemesDescription: "मरीज़ों के लिए सुझाए गए सहायता विकल्प। सहायता और पंजीकरण आवश्यकताएँ देखने के लिए योजना चुनें।", loadingSchemes: "सुझाई गई योजनाएँ लोड हो रही हैं...", noSchemes: "अभी कोई योजना सुझाई नहीं गई है।", recommended: "सुझाई गई", registered: "पंजीकृत", viewDetails: "विवरण देखें", backToSchemes: "योजनाओं पर वापस जाएँ", schemeNotFound: "योजना नहीं मिली", schemeUnavailable: "यह योजना अब डेमो में उपलब्ध नहीं है।", benefits: "लाभ", eligibility: "पात्रता", requiredDocuments: "आवश्यक दस्तावेज़", applicableCategories: "लागू श्रेणियाँ", registerForScheme: "इस योजना के लिए पंजीकरण करें", registrationStarted: "पंजीकरण शुरू हुआ",
        schemeRegistration: "योजना पंजीकरण", backToDetails: "योजना विवरण पर वापस जाएँ", registerFor: "पंजीकरण करें:", registrationDescription: "मरीज़ की जानकारी भरें और आवश्यक दस्तावेज़ों की पुष्टि करें।", patientName: "मरीज़ का नाम", age: "उम्र", villageArea: "गाँव / क्षेत्र", ifAvailable: "(यदि उपलब्ध हो)", healthCategory: "स्वास्थ्य श्रेणी / स्थिति", contactNumber: "संपर्क नंबर", documentsHelp: "इस पंजीकरण के लिए उपलब्ध हर दस्तावेज़ पर निशान लगाएँ।", declaration: "मैं पुष्टि करता/करती हूँ कि मरीज़ की जानकारी और दस्तावेज़ सूची इस पंजीकरण के लिए सही है।", submitRegistration: "पंजीकरण जमा करें", registrationSuccess: "पंजीकरण सफलतापूर्वक जमा किया गया", registrationRecorded: "{schemeName} के लिए आपका फ्रंटएंड डेमो पंजीकरण दर्ज हो गया है।", referenceNumber: "संदर्भ नंबर", registrationDate: "पंजीकरण की तारीख", registrationStatus: "पंजीकरण स्थिति", viewRegistration: "पंजीकरण देखें", registrationDetails: "पंजीकरण विवरण",
        profileUnavailable: "प्रोफ़ाइल उपलब्ध नहीं है", profileUnavailableDescription: "अपनी आशा कार्यकर्ता प्रोफ़ाइल देखने के लिए लॉग इन करें।", goToLogin: "लॉग इन पर जाएँ", workerAccount: "आशा कार्यकर्ता खाता", profileSettings: "प्रोफ़ाइल और सेटिंग्स", communityWorker: "सामुदायिक स्वास्थ्य कार्यकर्ता", email: "ईमेल", ashaId: "आशा आईडी", villageBlockDistrict: "गाँव / ब्लॉक / ज़िला", totalPoints: "कुल अंक", notAvailable: "उपलब्ध नहीं", savedOnDevice: "ये विकल्प इस डिवाइस पर सहेजे जाते हैं।", skipToContent: "मुख्य सामग्री पर जाएँ", appFooter: "AshaCare आशा कार्यकर्ताओं को सामुदायिक देखभाल समन्वित करने में मदद करता है।", patientListNote: "मरीज़ सूची डैशबोर्ड से जोड़ी जाएगी", rewardsNote: "रिवॉर्ड्स पेज तैयार होने पर जोड़े जाएँगे",
    },
};

const LanguageContext = createContext(null);

const getSavedSettings = () => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
};

export const LanguageProvider = ({ children }) => {
    const saved = getSavedSettings();
    const [preferredLanguage, setPreferredLanguage] = useState(saved.preferredLanguage === "hi" ? "hi" : "en");
    const [textSize, setTextSize] = useState(["small", "medium", "large"].includes(saved.textSize) ? saved.textSize : "medium");
    const [highContrast, setHighContrast] = useState(Boolean(saved.highContrast));
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify({ preferredLanguage, textSize, highContrast }));
        document.documentElement.lang = preferredLanguage;
        document.documentElement.dataset.textSize = textSize;
        document.documentElement.classList.toggle("high-contrast", highContrast);
    }, [preferredLanguage, textSize, highContrast]);
    const value = useMemo(() => ({ preferredLanguage, setPreferredLanguage, textSize, setTextSize, highContrast, setHighContrast, t: translations[preferredLanguage] }), [preferredLanguage, textSize, highContrast]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
