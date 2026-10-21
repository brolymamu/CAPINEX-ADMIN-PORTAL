let users = [

    {
        id: "Rohan",
        name: "Rohan",
        role: "agent",
        team: "TEAM01",
        branch: "MAGADI",
        agentLocations: ["MH", "AP", "TL"],
        minLoanAmount: 1500000,
        maxLoanAmount: 5000000
    },

    {
        id: "Rahul",
        name: "Rahul Kumar",
        role: "agent",
        team: "TEAM02",
        branch: "Reva"
    },

    {
        id: "Ajay",
        name: "Ajay Singh",
        role: "agent",
        team: "TEAM01",
        branch: "MAGADI"
    },

    {
        id: "Arun",
        name: "Arun Kumar",
        role: "tl",
        team: "TEAM01",
        branch: "MAGADI"
    },

    {
        id: "Vijay",
        name: "Vijay Sharma",
        role: "manager",
        branch: "Bangalore"
    },
    {
        id: "HQEXEC01",
        name: "Higher Management",
        role: "higher_management",
        branch: ""
    },

    {
        id: "Malik",
        name: "Backend Administrator",
        role: "backend",
        branch: "Bangalore"
    },

    {
        id: "ASSIGN01",
        name: "Customer Assigner",
        role: "assigner",
        branch: "Bangalore"
    },
    {
        id: "AXIS01",
        name: "Axis Bank Backend",
        role: "bank_backend",
        bankName: "AXIS"
    },
    {
        id: "IDFC01",
        name: "IDFC Bank Backend",
        role: "bank_backend",
        bankName: "IDFC"
    },
    {
        id: "HDFC01",
        name: "HDFC Bank Backend",
        role: "bank_backend",
        bankName: "HDFC"
    },
    {
        id: "ICICI01",
        name: "ICICI Bank Backend",
        role: "bank_backend",
        bankName: "ICICI"
    }

];
const DEMO_DEFAULT_PASSWORDS = Object.freeze({
    Rohan: "Login@123",
    Rahul: "Login@123",
    Ajay: "Login@123",
    Arun: "TL@123",
    Vijay: "Manager@123",
    HQEXEC01: "Executive@123",
    Malik: "backend@123",
    ASSIGN01: "Assign@123",
    AXIS01: "Bank@123",
    IDFC01: "Bank@123",
    HDFC01: "Bank@123",
    ICICI01: "Bank@123"
});
let portalBranches = [...new Set(users.map(user => String(user.branch || "").trim()).filter(Boolean))].sort();

let customers = [];



const LEGACY_AGENT_ID_MAP = {
    AG1001: "Rohan",
    AG1002: "Rahul",
    AG1003: "Ajay"
};

function resolveCustomerAgentId(agentId) {
    if (!agentId) return "";

    const directMatch = users.find(user => user.id === agentId);
    if (directMatch) return directMatch.id;

    const normalizedAgentId = String(agentId).trim().toUpperCase();
    const mappedAgentId = LEGACY_AGENT_ID_MAP[normalizedAgentId];
    if (mappedAgentId && users.some(user => user.id === mappedAgentId)) {
        return mappedAgentId;
    }

    const looseMatch = users.find(user => user.id.toUpperCase() === normalizedAgentId);
    return looseMatch ? looseMatch.id : agentId;
}

function teamsMatch(first, second) {
    return Boolean(first && second &&
        String(first).trim().toLowerCase() === String(second).trim().toLowerCase());
}

function resolveCustomerAgent(customer) {
    if (!customer) return null;
    const resolvedId = resolveCustomerAgentId(customer.agentId);
    return users.find(user => user.id === resolvedId) || null;
}

const OUTSTANDING_LOAN_FIELDS = [
    { key: "outstandingHomeLoan", label: "Home Loan Outstanding", name: "Home Loan" },
    { key: "outstandingPersonalLoan", label: "Personal Loan Outstanding", name: "Personal Loan" },
    { key: "outstandingCarBikeLoan", label: "Car/Bike Loan Outstanding", name: "Car/Bike Loan" },
    { key: "outstandingAutoLoan", label: "Auto Loan Outstanding", name: "Auto Loan" },
    { key: "outstandingAppLoan", label: "App Loan Outstanding", name: "App Loan" },
    { key: "outstandingCreditCardLoan", label: "Loan under Credit Card Outstanding", name: "Loan under Credit Card" },
    { key: "outstandingCreditCard", label: "Credit Card Outstanding", name: "Credit Card" },
    { key: "outstandingPropertyLoan", label: "Property Loan Outstanding", name: "Property Loan" },
    { key: "outstandingEducationLoan", label: "Education Loan Outstanding", name: "Education Loan" },
    { key: "outstandingGoldLoan", label: "Gold Loan Outstanding", name: "Gold Loan" },
    { key: "outstandingConsumerLoan", label: "Consumer Loan Outstanding", name: "Consumer Loan" },
    { key: "outstandingOdLoan", label: "OD Loan Outstanding", name: "OD Loan" },
    { key: "outstandingOtherLoans", label: "Other Loans Outstanding", name: "Other Loans" }
];
const OUTSTANDING_LOAN_KEYS = OUTSTANDING_LOAN_FIELDS.map(field => field.key);
const EMI_LOAN_FIELDS = OUTSTANDING_LOAN_FIELDS.map(field => ({
    key: field.key.replace(/^outstanding/, "emi"),
    label: `${field.name} EMI`,
    name: field.name
}));
const EMI_LOAN_KEYS = EMI_LOAN_FIELDS.map(field => field.key);

const BANK_PROCESSING_STATUSES = [
    "TL Approved",
    "Logged In",
    "Underwriting",
    "Documents Pending",
    "Approved",
    "Rejected",
    "Disbursed"
];
let bankQueueStatusFilter = "all";
const tlBankApplicationFilters = {
    sent: { search: "", bank: "", from: "", to: "" },
    approved: { search: "", bank: "", from: "", to: "" },
    rejected: { search: "", bank: "", from: "", to: "" }
};

function normalizeBankProcessingStatus(status) {
    const normalized = String(status || "").trim().toLowerCase();
    const aliases = {
        "sent to bank": "TL Approved",
        "tl approved": "TL Approved",
        "in process": "Underwriting",
        underwriting: "Underwriting",
        "documents pending": "Documents Pending",
        "logged in": "Logged In",
        new: "TL Approved",
        approved: "Approved",
        rejected: "Rejected",
        disbursed: "Disbursed"
    };

    return aliases[normalized] || "TL Approved";
}

function normalizeBankName(bankName) {
    const normalized = String(bankName || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const bankAliases = {
        axis: "axis",
        axisbank: "axis",
        idfc: "idfc",
        idfcfirst: "idfc",
        idfcfirstbank: "idfc",
        idfcbank: "idfc",
        hdfc: "hdfc",
        hdfcbank: "hdfc",
        icici: "icici",
        icicibank: "icici",
        sbi: "sbi",
        statebankofindia: "sbi",
        kotak: "kotak",
        kotakmahindra: "kotak",
        kotakmahindrabank: "kotak",
        yes: "yes",
        yesbank: "yes"
    };

    if (bankAliases[normalized]) return bankAliases[normalized];

    // Tolerate longer free-text names such as "Axis Bank Ltd" or "HDFC Bank Limited".
    const knownBanks = [
        ["axis", "axis"],
        ["idfc", "idfc"],
        ["hdfc", "hdfc"],
        ["icici", "icici"],
        ["statebankofindia", "sbi"],
        ["kotak", "kotak"],
        ["yesbank", "yes"]
    ];
    const match = knownBanks.find(([fragment]) => normalized.includes(fragment));
    return match ? match[1] : normalized;
}

let currentUser = null;
let currentManagementPage = "agent";
let selectedCustomerIds = new Set();
let selectedAssignmentCustomerIds = new Set();
let dashboardCustomerStatuses = null;
let dashboardStatusDateFilter = { preset: "all", start: "", end: "" };
let performanceDrill = { branch: "", floor: "", manager: "", teamLeader: "" };
let callbackNotificationTimer = null;
const notifiedCallbackIds = new Set();
const selectedCustomerDocumentIds = new Set();
const customerDocumentFiles = new Map();
const seenTLReturnsByAgent = new Map();

function setRuntimeStatus(message, state = "info") {
    ["runtimeStatus"].forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        element.textContent = message;
        element.dataset.state = state;
    });
}

function getSeenTLReturns() {
    if (!currentUser || currentUser.role !== "agent") return {};
    return seenTLReturnsByAgent.get(currentUser.id) || {};
}

function renderAgentReturnNotifications() {
    const container = document.getElementById("agentReturnNotifications");
    if (!container) return;
    container.replaceChildren();
    if (!currentUser || currentUser.role !== "agent") return;

    const seenReturns = getSeenTLReturns();
    const returnedCustomers = customers.filter(customer =>
        resolveCustomerAgentId(customer.agentId) === currentUser.id &&
        customer.approvalStatus === "returned" &&
        String(customer.tlReturnComment || "").trim()
    );

    returnedCustomers.forEach(customer => {
        const returnKey = String(customer.tlReturnAt || customer.reviewedAt || customer.tlReturnComment);
        if (seenReturns[customer.id] === returnKey) return;

        const notification = document.createElement("article");
        notification.className = "agent-return-notification";
        notification.setAttribute("role", "alert");

        const heading = document.createElement("strong");
        heading.textContent = `Application returned: ${customer.name || "Customer"}`;

        const comment = document.createElement("p");
        comment.textContent = customer.tlReturnComment;

        const actions = document.createElement("div");
        actions.className = "agent-return-notification-actions";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.textContent = "Open application";
        openButton.addEventListener("click", () => openCustomer(Number(customer.id)));

        const dismissButton = document.createElement("button");
        dismissButton.type = "button";
        dismissButton.textContent = "Dismiss";
        dismissButton.addEventListener("click", () => {
            seenReturns[customer.id] = returnKey;
            seenTLReturnsByAgent.set(currentUser.id, seenReturns);
            notification.remove();
        });

        actions.append(openButton, dismissButton);
        notification.append(heading, comment, actions);
        container.append(notification);
    });
}

function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.dataset.theme = isLight ? "light" : "dark";

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        const nextMode = isLight ? "dark" : "light";
        const icon = toggle.querySelector(".theme-toggle-icon");
        if (icon) icon.textContent = isLight ? "☾" : "☼";
        toggle.setAttribute("aria-label", `Switch to ${nextMode} mode`);
        toggle.setAttribute("title", `Switch to ${nextMode} mode`);
        toggle.setAttribute("aria-pressed", String(isLight));
    }
}

function toggleTheme() {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    try {
        localStorage.setItem("capinex-theme", nextTheme);
    } catch (error) {
        // The selected theme still works for this page if storage is unavailable.
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let savedTheme = "dark";
    try {
        savedTheme = localStorage.getItem("capinex-theme") || "dark";
    } catch (error) {
        // Use the default theme when storage is unavailable.
    }
    applyTheme(savedTheme);
    setRuntimeStatus("Memory-only demo · changes reset on refresh", "info");
    setupCustomerDocumentDropzone();
});


/* ================= SIDEBAR ================= */

function toggleSidebar() {
    const app = document.getElementById("app");
    const toggle = document.querySelector(".sidebar-toggle");
    document.querySelectorAll(".sidebar .nav-item").forEach(item => {
        const label = item.textContent.trim().replace(/\s+/g, " ");
        if (label) item.title = label;
    });
    const isCollapsed = app.classList.toggle("sidebar-collapsed");
    toggle?.setAttribute("aria-expanded", String(!isCollapsed));
    toggle?.setAttribute("aria-label", isCollapsed ? "Expand sidebar" : "Minimize sidebar");
    toggle?.setAttribute("title", isCollapsed ? "Expand sidebar" : "Minimize sidebar");
}

/* ================= ACCOUNT MENU & PASSWORD ================= */

function toggleAccountMenu() {
    const menu = document.getElementById("accountMenu");
    const button = document.getElementById("topAvatar");
    const isOpening = menu.classList.contains("hidden");
    menu.classList.toggle("hidden", !isOpening);
    button.setAttribute("aria-expanded", String(isOpening));
}

function closeAccountMenu() {
    document.getElementById("accountMenu")?.classList.add("hidden");
    document.getElementById("topAvatar")?.setAttribute("aria-expanded", "false");
}

function openChangePassword() {
    closeAccountMenu();
    document.getElementById("changePasswordMessage").textContent = "";
    document.getElementById("changePasswordMessage").classList.remove("success");
    document.getElementById("changePasswordForm").reset();
    document.getElementById("changePasswordModal").classList.remove("hidden");
    document.getElementById("currentPassword").focus();
}

function closeChangePassword() {
    document.getElementById("changePasswordModal").classList.add("hidden");
}

document.getElementById("changePasswordForm").addEventListener("submit", event => {
    event.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;
    const message = document.getElementById("changePasswordMessage");

    if (!currentUser) return;
    if (newPassword.length < 8) {
        message.classList.remove("success");
        message.textContent = "New password must be at least 8 characters.";
        return;
    }
    if (newPassword !== confirmPassword) {
        message.classList.remove("success");
        message.textContent = "New passwords do not match.";
        return;
    }

    const expectedPassword = currentUser.password || DEMO_DEFAULT_PASSWORDS[currentUser.id];
    if (currentPassword !== expectedPassword) {
        message.classList.remove("success");
        message.textContent = "Current password is incorrect.";
        return;
    }

    currentUser.password = newPassword;
    message.classList.add("success");
    message.textContent = "Password changed for this page session only.";
    event.target.reset();
});

document.addEventListener("click", event => {
    const menu = document.getElementById("accountMenu");
    if (menu && !event.target.closest(".top-account-menu")) closeAccountMenu();
});

/* ================= RESET VIEW STATE ================= */

// Filters, selections and drill-downs belong to the person who set them.
// Without this reset, an assigner's "None Assigned" filter stayed active
// (even though hidden) and an agent logging in afterwards saw no customers.
function resetPortalViewState() {
    ["Name", "Phone", "Cibil", "Loan", "Place", "Location"].forEach(field => {
        const input = document.getElementById(`customerFilter${field}`);
        if (input) input.value = "";
    });
    ["statusFilter", "assignmentBranchFilter", "assignmentAssigneeFilter", "assignmentStatusFilter"].forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = "all";
    });
    ["assignmentSelectCount", "tlBankSearch", "tlApprovedSearch", "tlRejectedSearch",
        "customerFilterDateFrom", "customerFilterDateTo", "leadsFilterDateFrom", "leadsFilterDateTo",
        "bankQueueDateFrom", "bankQueueDateTo", "tlBankDateFrom", "tlBankDateTo",
        "tlApprovedDateFrom", "tlApprovedDateTo", "tlRejectedDateFrom", "tlRejectedDateTo"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    const bulkAgent = document.getElementById("bulkAssignmentAgent");
    if (bulkAgent) bulkAgent.value = "";

    selectedCustomerIds = new Set();
    selectedAssignmentCustomerIds = new Set();
    selectedCustomerDocumentIds.clear();
    dashboardCustomerStatuses = null;
    bankQueueStatusFilter = "all";
    Object.values(tlBankApplicationFilters).forEach(filter => {
        filter.search = "";
        filter.bank = "";
        filter.from = "";
        filter.to = "";
    });
    performanceDrill = { branch: "", floor: "", manager: "", teamLeader: "" };
    dashboardStatusDateFilter = { preset: "all", start: "", end: "" };
    const preset = document.getElementById("dashboardDatePreset");
    if (preset) preset.value = "all";
    ["dashboardDateStart", "dashboardDateEnd"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    document.getElementById("dashboardCustomDateRange")?.classList.add("hidden");
}


/* ================= LOGIN ================= */

function login() {

    const id =
        document
            .getElementById("loginId")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    const loginError = document.getElementById("loginError");
    loginError.textContent = "";
    const user = users.find(member => member.id.toLowerCase() === id.toLowerCase());
    const expectedPassword = user?.password || DEMO_DEFAULT_PASSWORDS[user?.id];
    if (!user || password !== expectedPassword) {
        loginError.textContent = "Login ID or password is incorrect.";
        return;
    }

    resetPortalViewState();
    currentUser = user;
    showApplication();
    requestCallbackNotificationPermission();
    startCallbackReminderWatcher();
}

document.addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        ["loginId", "password"].includes(event.target.id)
    ) {
        event.preventDefault();
        login();
    }
});


/* ================= SHOW APPLICATION ================= */

function showApplication() {

    renderAgentReturnNotifications();
    setRuntimeStatus("Memory-only demo · changes reset on refresh", "info");

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    document
        .getElementById("sidebarUserName")
        .textContent =
        currentUser.name;


    document
        .getElementById("sidebarUserRole")
        .textContent = currentUser.role.replace(/_/g, " ").toUpperCase();


    const firstLetter =
        currentUser.name
            .charAt(0)
            .toUpperCase();


    document
        .getElementById("userAvatar")
        .textContent = firstLetter;

    document
        .getElementById("topAvatar")
        .textContent = firstLetter;


    configurePermissions();

    showSection(currentUser.role === "bank_backend"
        ? "bank-queue"
        : currentUser.role === "higher_management" ? "performance" : "dashboard");

}




function updateMemberRoleFields() {
    const newRole = currentManagementPage;
    const editRole = document.getElementById("editAgentRole")?.value;
    const roleFor = field => field.closest("#agentForm") ? newRole : editRole;
    const noTeamRoles = ["manager", "assigner", "bank_backend", "higher_management"];

    document.querySelectorAll(
        "#agentForm .member-team-field, #editAgentForm .member-team-field, " +
        "#agentForm .member-assignment-field, #editAgentForm .member-assignment-field"
    ).forEach(field => field.classList.toggle("hidden", noTeamRoles.includes(roleFor(field))));
    document.querySelectorAll("#agentForm .member-bank-field, #editAgentForm .member-bank-field")
        .forEach(field => field.classList.toggle("hidden", roleFor(field) !== "bank_backend"));
    document.querySelectorAll("#agentForm .member-branch-field, #editAgentForm .member-branch-field")
        .forEach(field => field.classList.toggle("hidden", roleFor(field) === "higher_management"));
}

document.getElementById("newAgentRole")?.addEventListener("change", updateMemberRoleFields);
document.getElementById("editAgentRole")?.addEventListener("change", updateMemberRoleFields);

function configurePermissions() {

    const assignmentNav =
        document.getElementById("assignmentNav");

    const performanceNav =
        document.getElementById("performanceNav");
    const leadsToApproveNav = document.getElementById("leadsToApproveNav");
    const tlBankApplicationsNav = document.getElementById("tlBankApplicationsNav");
    const tlApprovedApplicationsNav = document.getElementById("tlApprovedApplicationsNav");
    const tlRejectedApplicationsNav = document.getElementById("tlRejectedApplicationsNav");

    const addButton =
        document.getElementById("addCustomerButton");
    const forwardButton = document.getElementById("forwardCustomerToTLButton");

    const uploadButton =
        document.getElementById("uploadCustomersButton");

    const agentsNav = document.getElementById("agentsNav");
    const teamLeadersNav = document.getElementById("teamLeadersNav");
    const managersNav = document.getElementById("managersNav");
    const assignersNav = document.getElementById("assignersNav");
    const bankBackendsNav = document.getElementById("bankBackendsNav");
    const higherManagementNav = document.getElementById("higherManagementNav");
    const branchesNav = document.getElementById("branchesNav");
    const membersNavGroup = document.getElementById("membersNavGroup");
    const bankQueueNav = document.getElementById("bankQueueNav");

    const bulkRemoveButton =
        document.getElementById("bulkRemoveCustomersButton");

    const bulkAssignmentPanel =
        document.getElementById("bulkAssignmentPanel");

    const assignmentFilters =
        document.getElementById("assignmentFilters");

    const customerSelectHeader =
        document.getElementById("customerSelectHeader");

    const memberRoleSelect = document.getElementById("newAgentRole");
    const editMemberRoleSelect = document.getElementById("editAgentRole");
    [memberRoleSelect, editMemberRoleSelect].forEach(select => {
        if (!select) return;
        Array.from(select.options).forEach(option => {
            option.hidden = currentUser.role === "manager" && option.value !== "agent";
        });
        if (currentUser.role === "manager") select.value = "agent";
    });
    updateMemberRoleFields();

    uploadButton.classList.add("hidden");
    forwardButton?.classList.toggle("hidden", currentUser.role !== "agent");
    if (currentUser.role === "higher_management") {
        ["dashboardNav", "customersNav", "leadsToApproveNav", "tlBankApplicationsNav",
            "tlApprovedApplicationsNav", "tlRejectedApplicationsNav", "bankQueueNav",
            "branchesNav", "membersNavGroup"].forEach(id =>
            document.getElementById(id)?.classList.add("hidden")
        );
        performanceNav?.classList.remove("hidden");
        assignmentNav?.classList.add("hidden");
        addButton.classList.add("hidden");
        return;
    }
    leadsToApproveNav?.classList.toggle("hidden", currentUser.role !== "tl");
    tlBankApplicationsNav?.classList.toggle("hidden", currentUser.role !== "tl");
    tlApprovedApplicationsNav?.classList.toggle("hidden", currentUser.role !== "tl");
    tlRejectedApplicationsNav?.classList.toggle("hidden", currentUser.role !== "tl");
    [agentsNav, teamLeadersNav, managersNav, assignersNav, bankBackendsNav, higherManagementNav].forEach(nav => nav?.classList.add("hidden"));
    branchesNav?.classList.toggle("hidden", currentUser.role !== "backend");
    bankQueueNav?.classList.toggle("hidden", currentUser.role !== "bank_backend");
    document.getElementById("dashboardNav")?.classList.toggle("hidden", currentUser.role === "bank_backend");
    document.getElementById("customersNav")?.classList.toggle("hidden", currentUser.role === "bank_backend");
    performanceNav?.classList.toggle("hidden", currentUser.role === "bank_backend");
    if (currentUser.role === "bank_backend") addButton.classList.add("hidden");
    membersNavGroup?.classList.add("hidden");
    bulkRemoveButton.classList.add("hidden");
    bulkAssignmentPanel.classList.add("hidden");
    assignmentFilters.classList.toggle("hidden", currentUser.role === "agent");
    customerSelectHeader.classList.add("hidden");


    if (currentUser.role === "agent") {

        assignmentNav?.classList.add("hidden");

        performanceNav.classList.add("hidden");

        addButton.classList.remove("hidden");

        document
            .getElementById("customerDescription")
            .textContent =
            "Customers assigned to you";

    }


    if (currentUser.role === "tl") {

        assignmentNav?.classList.remove("hidden");

        performanceNav.classList.remove("hidden");

        addButton.classList.remove("hidden");
        bulkAssignmentPanel.classList.remove("hidden");

        document
            .getElementById("customerDescription")
            .textContent =
            "Customers assigned to your team";

    }


    if (["manager", "backend", "assigner"].includes(currentUser.role)) {

        assignmentNav?.classList.remove("hidden");

        performanceNav.classList.remove("hidden");

        addButton.classList.add("hidden");
        uploadButton.classList.remove("hidden");
        if (currentUser.role === "manager") {
            agentsNav?.classList.remove("hidden");
            membersNavGroup?.classList.remove("hidden");
        }
        if (currentUser.role === "backend") {
            [agentsNav, teamLeadersNav, managersNav, assignersNav, bankBackendsNav, higherManagementNav].forEach(nav => nav?.classList.remove("hidden"));
            membersNavGroup?.classList.remove("hidden");
        }
        bulkAssignmentPanel.classList.remove("hidden");

        document
            .getElementById("customerDescription")
            .textContent = currentUser.role === "assigner" || currentUser.role === "backend"
                ? "All customers across branches"
                : "All customers in your branch";

    }

    if (["tl", "manager", "backend"].includes(currentUser.role)) {
        bulkRemoveButton.classList.remove("hidden");
    }
    if (["tl", "manager", "backend", "assigner"].includes(currentUser.role)) {
        customerSelectHeader.classList.remove("hidden");
    }

}


/* ================= GET ACCESSIBLE CUSTOMERS ================= */

function getVisibleCustomers() {

    if (currentUser.role === "agent") {

        return customers.filter(
            c =>
                resolveCustomerAgentId(c.agentId) === currentUser.id
        );

    }


    if (currentUser.role === "tl") {

        // A TL can see customers assigned to them or to agents in their team.
        return customers.filter(customer => {
            const normalizedAgentId = resolveCustomerAgentId(customer.agentId);
            if (normalizedAgentId === currentUser.id) return true;

            const assignedUser = users.find(user => user.id === normalizedAgentId);
            return assignedUser?.role === "agent" && assignedUser.team === currentUser.team;
        });

    }

    if (currentUser.role === "higher_management") return customers;

    if (currentUser.role === "bank_backend") {
        const bank = normalizeBankName(currentUser.bankName);
        return bank
            ? customers.filter(customer =>
                customer.approvalStatus === "approved" &&
                normalizeBankName(customer.banksPushing) === bank
            )
            : [];
    }


    if (["backend", "assigner"].includes(currentUser.role)) return customers;

    if (currentUser.role === "manager") {
        return customers.filter(customer => {
            const assignedMember = resolveCustomerAgent(customer);
            const branch = assignedMember?.branch || customer.branch;
            return teamsMatch(branch, currentUser.branch);
        });
    }


    return [];

}


function renderPerformanceLoanAmounts() {
    const data = getVisibleCustomers();
    const container = document.getElementById("performanceCards");
    const breadcrumbs = document.getElementById("performanceBreadcrumbs");
    if (!container || !breadcrumbs) return;

    container.classList.toggle("performance-grid", currentUser?.role !== "higher_management");

    if (currentUser?.role === "higher_management") {
        renderHigherManagementPerformance(data, container, breadcrumbs);
        return;
    }

    if (currentUser?.role === "tl") {
        const sameValue = (first, second) =>
            String(first || "").trim().toLowerCase() === String(second || "").trim().toLowerCase();
        const teamAgents = users.filter(user =>
            user.role === "agent" && sameValue(user.team, currentUser.team)
        );
        const teamCustomers = data.filter(customer => {
            const agentId = resolveCustomerAgentId(customer.agentId);
            const agent = users.find(user => user.id === agentId);
            return agent?.role === "agent" && sameValue(agent.team, currentUser.team);
        });
        const cards = teamAgents.map(agent => {
            const agentCustomers = teamCustomers.filter(customer =>
                resolveCustomerAgentId(customer.agentId) === agent.id
            );
            const countStatus = status => agentCustomers.filter(customer =>
                normalizeCustomerStatus(customer.status) === status
            ).length;
            const pending = ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"]
                .reduce((count, status) => count + countStatus(status), 0);
            const approved = countStatus("Eligible") + countStatus("Approved");
            const loanTotal = agentCustomers.reduce((total, customer) =>
                total + Number(customer.loanAmount || 0), 0
            );
            const amountStatus = status => agentCustomers
                .filter(customer => normalizeCustomerStatus(customer.status) === status)
                .reduce((total, customer) => total + Number(customer.loanAmount || 0), 0);
            return `
                <article class="performance-card">
                    <h3>${escapeHTML(agent.name)}</h3>
                    <div class="performance-stat"><span>Customers</span><strong>${agentCustomers.length}</strong></div>
                    <div class="performance-stat"><span>Not Called</span><strong>${countStatus("Not Called")}</strong></div>
                    <div class="performance-stat"><span>Call Back</span><strong>${countStatus("Call Back")}</strong></div>
                    <div class="performance-stat"><span>Not Interested</span><strong>${countStatus("Not Interested")}</strong></div>
                    <div class="performance-stat"><span>Pending / Review / Bank Processing</span><strong>${pending}</strong></div>
                    <div class="performance-stat"><span>Eligible / Approved</span><strong>${approved}</strong></div>
                    <div class="performance-stat"><span>Not Eligible</span><strong>${countStatus("Not Eligible")}</strong></div>
                    <div class="performance-stat"><span>Rejected</span><strong>${formatMoney(amountStatus("Rejected"))}</strong></div>
                    <div class="performance-stat"><span>Disbursed</span><strong>${formatMoney(amountStatus("Disbursed"))}</strong></div>
                    <div class="performance-stat"><span>Total Loan Amount</span><strong>${formatMoney(loanTotal)}</strong></div>
                </article>
            `;
        });

        breadcrumbs.innerHTML = `<span>${escapeHTML(currentUser.team || "My Team")}</span>`;
        container.innerHTML = cards.length
            ? cards.join("")
            : '<p class="history-empty">No agents are configured in your team.</p>';
        return;
    }

    const assignedUser = customer => users.find(user =>
        user.id === resolveCustomerAgentId(customer.agentId)
    );
    const sameValue = (first, second) =>
        String(first || "").trim().toLowerCase() === String(second || "").trim().toLowerCase();
    const customerBranch = customer => assignedUser(customer)?.branch || customer.branch || "";
    const customerFloor = customer => String(assignedUser(customer)?.floor || customer.floor || "").trim();
    const matchesFloor = (customer, floor) => floor === "__unassigned__"
        ? !customerFloor(customer)
        : sameValue(customerFloor(customer), floor);
    const customerTeam = customer => assignedUser(customer)?.team || "";
    const recordsForBranch = branch => data.filter(customer => sameValue(customerBranch(customer), branch));
    const membersForBranch = branch => users.filter(user =>
        user.role === "agent"
            ? sameValue(user.branch, branch)
            : user.role === "tl" && (sameValue(user.branch, branch) ||
                users.some(agent => agent.role === "agent" &&
                    sameValue(agent.team, user.team) && sameValue(agent.branch, branch)))
    );
    const agentsForTeam = (team, branch, floor = "") => users.filter(user =>
        user.role === "agent" &&
        sameValue(user.team, team) &&
        sameValue(user.branch, branch) &&
        (!floor || (floor === "__unassigned__"
            ? !String(user.floor || "").trim()
            : sameValue(user.floor, floor)))
    );
    const recordsForTeam = (team, branch, floor = "") => data.filter(customer =>
        sameValue(customerTeam(customer), team) &&
        sameValue(customerBranch(customer), branch) &&
        (!floor || matchesFloor(customer, floor))
    );

    const statsCard = (title, records, action = "", value = "") => {
        const countStatus = status => records.filter(customer =>
            normalizeCustomerStatus(customer.status) === status
        ).length;
        const loanTotal = records.reduce((total, customer) =>
            total + Number(customer.loanAmount || 0), 0
        );
        const amountStatus = status => records
            .filter(customer => normalizeCustomerStatus(customer.status) === status)
            .reduce((total, customer) => total + Number(customer.loanAmount || 0), 0);
        const stages = [
            { label: "Not Called", color: "#2563eb", count: countStatus("Not Called") },
            { label: "Call Back", color: "#06b6d4", count: countStatus("Call Back") },
            { label: "Not Interested", color: "#64748b", count: countStatus("Not Interested") },
            { label: "Pending / Review / Bank Processing", color: "#f59e0b", count: ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"].reduce((count, status) => count + countStatus(status), 0) },
            { label: "Eligible / Approved", color: "#16a34a", count: countStatus("Eligible") + countStatus("Approved") },
            { label: "Not Eligible", color: "#7c3aed", count: countStatus("Not Eligible") },
            { label: "Rejected", color: "#dc2626", count: countStatus("Rejected") },
            { label: "Disbursed", color: "#0891b2", count: countStatus("Disbursed") }
        ];
        const progress = stages.map(stage =>
            `<span title="${escapeHTML(stage.label)}: ${stage.count}" style="width:${records.length ? (stage.count / records.length) * 100 : 0}%;background:${stage.color}"></span>`
        ).join("");
        return `
            <article
                class="performance-card${action ? " performance-card-clickable" : ""}"
                ${action ? `role="button" tabindex="0" data-performance-action="${action}" data-performance-value="${escapeHTML(value)}"` : ""}
            >
                <h3>${escapeHTML(title)}</h3>
                <div class="performance-progress" aria-label="Application status breakdown">${progress}</div>
                <div class="performance-stat"><span>Customers</span><strong>${records.length}</strong></div>
                <div class="performance-stat"><span>Not Called</span><strong>${countStatus("Not Called")}</strong></div>
                <div class="performance-stat"><span>Call Back</span><strong>${countStatus("Call Back")}</strong></div>
                <div class="performance-stat"><span>Not Interested</span><strong>${countStatus("Not Interested")}</strong></div>
                <div class="performance-stat"><span>Pending / Review / Bank Processing</span><strong>${stages.find(stage => stage.label === "Pending / Review / Bank Processing").count}</strong></div>
                <div class="performance-stat"><span>Eligible / Approved</span><strong>${countStatus("Eligible") + countStatus("Approved")}</strong></div>
                <div class="performance-stat"><span>Not Eligible</span><strong>${countStatus("Not Eligible")}</strong></div>
                <div class="performance-stat"><span>Rejected</span><strong>${formatMoney(amountStatus("Rejected"))}</strong></div>
                <div class="performance-stat"><span>Disbursed</span><strong>${formatMoney(amountStatus("Disbursed"))}</strong></div>
                <div class="performance-stat"><span>Total Loan Amount</span><strong>${formatMoney(loanTotal)}</strong></div>
            </article>
        `;
    };

    const memberBranches = users
        .filter(user => ["agent", "tl", "manager"].includes(user.role))
        .map(user => String(user.branch || "").trim());
    const recordBranches = data.map(customer => String(customerBranch(customer) || "").trim());
    const configuredBranches = currentUser?.role === "backend"
        ? portalBranches
        : [];
    const branchNames = [...new Map([...configuredBranches, ...memberBranches, ...recordBranches]
        .filter(branch => branch && (currentUser?.role !== "manager" || sameValue(branch, currentUser.branch)))
        .map(branch => [branch.toLowerCase(), branch])).values()]
        .sort((a, b) => a.localeCompare(b));

    const leadersForBranch = (branch, floor = "") => users.filter(user => {
        if (user.role !== "tl") return false;
        const hasBranchTeam = users.some(agent =>
            agent.role === "agent" &&
            sameValue(agent.team, user.team) &&
            sameValue(agent.branch, branch)
        );
        if (!sameValue(user.branch, branch) && !hasBranchTeam) return false;
        if (!floor) return true;
        return (floor === "__unassigned__"
            ? !String(user.floor || "").trim()
            : sameValue(user.floor, floor)) ||
            agentsForTeam(user.team, branch, floor).length > 0;
    });
    const managersForBranch = branch => users.filter(user =>
        user.role === "manager" && sameValue(user.branch, branch)
    );
    const renderCards = cards => {
        container.innerHTML = cards.length
            ? cards.join("")
            : '<p class="history-empty">No performance data is available at this level.</p>';
        container.querySelectorAll("[data-performance-action]").forEach(card => {
            const activate = () => openPerformanceLevel(card.dataset.performanceAction, card.dataset.performanceValue);
            card.addEventListener("click", activate);
            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                }
            });
        });
    };

    const trail = [{ label: "All Branches", branch: "", floor: "", manager: "", teamLeader: "" }];
    if (performanceDrill.branch) trail.push({
        label: `${performanceDrill.branch} Branch`,
        branch: performanceDrill.branch,
        floor: "",
        manager: "",
        teamLeader: ""
    });
    if (performanceDrill.floor) trail.push({
        label: performanceDrill.floor === "__unassigned__" ? "No Floor Assigned" : performanceDrill.floor,
        branch: performanceDrill.branch,
        floor: performanceDrill.floor,
        manager: "",
        teamLeader: ""
    });
    if (performanceDrill.manager) {
        const manager = users.find(user => user.role === "manager" && user.id === performanceDrill.manager);
        trail.push({
            label: manager?.name || performanceDrill.manager,
            branch: performanceDrill.branch,
            floor: "",
            manager: performanceDrill.manager,
            teamLeader: ""
        });
    }
    if (performanceDrill.teamLeader) {
        const leader = users.find(user => user.id === performanceDrill.teamLeader);
        trail.push({
            label: leader?.name || performanceDrill.teamLeader,
            branch: performanceDrill.branch,
            floor: performanceDrill.floor,
            manager: performanceDrill.manager,
            teamLeader: performanceDrill.teamLeader
        });
    }
    breadcrumbs.innerHTML = trail.map((item, index) =>
        `${index ? '<span aria-hidden="true">›</span>' : ""}<button type="button" data-performance-crumb="${index}">${escapeHTML(item.label)}</button>`
    ).join("");
    breadcrumbs.querySelectorAll("[data-performance-crumb]").forEach(button => {
        button.addEventListener("click", () => {
            const item = trail[Number(button.dataset.performanceCrumb)];
            performanceDrill = {
                branch: item.branch,
                floor: item.floor,
                manager: item.manager,
                teamLeader: item.teamLeader
            };
            renderPerformanceLoanAmounts();
        });
    });

    if (!performanceDrill.branch) {
        renderCards(branchNames.map(branch =>
            statsCard(`${branch} Branch`, recordsForBranch(branch), "branch", branch)
        ));
        return;
    }

    if (performanceDrill.teamLeader) {
        const leader = users.find(user =>
            user.role === "tl" && user.id === performanceDrill.teamLeader
        );
        if (!leader) {
            performanceDrill = { branch: "", floor: "", manager: "", teamLeader: "" };
            renderPerformanceLoanAmounts();
            return;
        }
        const teamAgents = agentsForTeam(leader.team, performanceDrill.branch, performanceDrill.floor);
        renderCards(teamAgents.map(agent => statsCard(
            agent.name,
            data.filter(customer =>
                resolveCustomerAgentId(customer.agentId) === agent.id &&
                sameValue(customerBranch(customer), performanceDrill.branch) &&
                (!performanceDrill.floor || matchesFloor(customer, performanceDrill.floor))
            ),
            "",
            ""
        )));
        return;
    }

    if (performanceDrill.manager) {
        const manager = users.find(user =>
            user.role === "manager" && user.id === performanceDrill.manager
        );
        if (!manager || !sameValue(manager.branch, performanceDrill.branch)) {
            performanceDrill = { branch: "", floor: "", manager: "", teamLeader: "" };
            renderPerformanceLoanAmounts();
            return;
        }
        const leaders = leadersForBranch(performanceDrill.branch);
        if (leaders.length) {
            renderCards(leaders.map(leader => statsCard(
                `${leader.name} · ${leader.team || "Team"}`,
                recordsForTeam(leader.team, performanceDrill.branch),
                "leader",
                leader.id
            )));
        } else {
            const branchAgents = users.filter(user =>
                user.role === "agent" && sameValue(user.branch, performanceDrill.branch)
            );
            renderCards(branchAgents.map(agent => statsCard(
                agent.name,
                data.filter(customer =>
                    resolveCustomerAgentId(customer.agentId) === agent.id &&
                    sameValue(customerBranch(customer), performanceDrill.branch)
                )
            )));
        }
        return;
    }

    if (performanceDrill.floor) {
        const leaders = leadersForBranch(performanceDrill.branch, performanceDrill.floor);
        if (leaders.length) {
            renderCards(leaders.map(leader => statsCard(
                `${leader.name} · ${leader.team || "Team"}`,
                recordsForTeam(leader.team, performanceDrill.branch, performanceDrill.floor),
                "leader",
                leader.id
            )));
        } else {
            const floorAgents = users.filter(user =>
                user.role === "agent" &&
                sameValue(user.branch, performanceDrill.branch) &&
                (performanceDrill.floor === "__unassigned__"
                    ? !String(user.floor || "").trim()
                    : sameValue(user.floor, performanceDrill.floor))
            );
            renderCards(floorAgents.map(agent => statsCard(
                agent.name,
                data.filter(customer =>
                    resolveCustomerAgentId(customer.agentId) === agent.id &&
                    sameValue(customerBranch(customer), performanceDrill.branch) &&
                    matchesFloor(customer, performanceDrill.floor)
                )
            )));
        }
        return;
    }

    const branchMembers = membersForBranch(performanceDrill.branch);
    const branchManagers = managersForBranch(performanceDrill.branch);
    if (branchManagers.length) {
        renderCards(branchManagers.map(manager => statsCard(
            `${manager.name} · Manager`,
            recordsForBranch(performanceDrill.branch),
            "manager",
            manager.id
        )));
        return;
    }

    const floorNames = [...new Set(branchMembers.map(user => String(user.floor || "").trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    if (branchMembers.some(user => user.role === "agent" && !String(user.floor || "").trim()) ||
        data.some(customer => sameValue(customerBranch(customer), performanceDrill.branch) && !customerFloor(customer))) {
        floorNames.push("__unassigned__");
    }
    if (floorNames.length) {
        renderCards(floorNames.map(floor => statsCard(
            floor === "__unassigned__" ? "No Floor Assigned" : `${floor} Floor`,
            data.filter(customer =>
                sameValue(customerBranch(customer), performanceDrill.branch) &&
                matchesFloor(customer, floor)
            ),
            "floor",
            floor
        )));
        return;
    }

    const leaders = leadersForBranch(performanceDrill.branch);
    if (leaders.length) {
        renderCards(leaders.map(leader => statsCard(
            `${leader.name} · ${leader.team || "Team"}`,
            recordsForTeam(leader.team, performanceDrill.branch),
            "leader",
            leader.id
        )));
        return;
    }

    const branchAgents = branchMembers.filter(user => user.role === "agent");
    renderCards(branchAgents.map(agent => statsCard(
        agent.name,
        data.filter(customer => resolveCustomerAgentId(customer.agentId) === agent.id)
    )));
}

function renderHigherManagementPerformance(data, container, breadcrumbs) {
    const sameValue = (first, second) =>
        String(first || "").trim().toLowerCase() === String(second || "").trim().toLowerCase();
    const members = users.filter(user => ["manager", "tl", "agent"].includes(user.role));
    const memberFor = customer => members.find(user =>
        user.id === resolveCustomerAgentId(customer.agentId)
    );
    const branchFor = customer => memberFor(customer)?.branch || customer.branch || "";
    const floorFor = customer => memberFor(customer)?.floor || customer.floor || "";
    const recordsForBranch = branch => data.filter(customer => sameValue(branchFor(customer), branch));
    const recordsForScope = (branch, floor) => recordsForBranch(branch).filter(customer =>
        floor === "__unassigned__" ? !String(floorFor(customer)).trim() : sameValue(floorFor(customer), floor)
    );
    const assignedFloorMatches = (user, branch, floor) => {
        if (user.role === "agent") {
            return sameValue(user.branch, branch) && (floor === "__unassigned__"
                ? !String(user.floor || "").trim()
                : sameValue(user.floor, floor));
        }
        if (user.role === "tl") {
            return (sameValue(user.branch, branch) && (floor === "__unassigned__"
                ? !String(user.floor || "").trim()
                : sameValue(user.floor, floor))) ||
                members.some(agent => agent.role === "agent" && sameValue(agent.team, user.team) &&
                    sameValue(agent.branch, branch) && (floor === "__unassigned__"
                        ? !String(agent.floor || "").trim()
                        : sameValue(agent.floor, floor)));
        }
        return sameValue(user.branch, branch) && (floor === "__unassigned__"
            ? !String(user.floor || "").trim()
            : sameValue(user.floor, floor));
    };
    const teamLeadersFor = (branch, floor) => members.filter(user =>
        user.role === "tl" && assignedFloorMatches(user, branch, floor) &&
        members.some(agent => agent.role === "agent" && sameValue(agent.team, user.team) && sameValue(agent.branch, branch))
    );
    const agentsForTeam = (leader, branch, floor) => members.filter(user =>
        user.role === "agent" && sameValue(user.team, leader.team) && sameValue(user.branch, branch) &&
        (floor === "__unassigned__" ? !String(user.floor || "").trim() : sameValue(user.floor, floor))
    );
    const countStatus = (records, statuses) => records.filter(customer =>
        statuses.includes(normalizeCustomerStatus(customer.status))
    ).length;
    const stages = [
        { label: "Not Called", color: "#3b82f6", statuses: ["Not Called"] },
        { label: "Call Back", color: "#06b6d4", statuses: ["Call Back"] },
        { label: "Not Interested", color: "#64748b", statuses: ["Not Interested"] },
        { label: "Lead", color: "#0f766e", statuses: ["Lead"] },
        { label: "Not Responded", color: "#94a3b8", statuses: ["Not responded"] },
        { label: "Pending / Review / Bank", color: "#f59e0b", statuses: ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"] },
        { label: "Eligible / Approved", color: "#22c55e", statuses: ["Eligible", "Approved"] },
        { label: "Not Eligible", color: "#7c3aed", statuses: ["Not Eligible"] },
        { label: "Rejected", color: "#ef4444", statuses: ["Rejected"] },
        { label: "Disbursed", color: "#8b5cf6", statuses: ["Disbursed"] }
    ];
    const pendingStage = stages.find(stage => stage.label === "Pending / Review / Bank");
    const approvedStage = stages.find(stage => stage.label === "Eligible / Approved");
    const formatFloor = floor => floor === "__unassigned__" ? "No Floor Assigned" : floor;
    const current = performanceDrill;
    const crumbs = [{ label: "All Branches", branch: "", floor: "", manager: "", teamLeader: "" }];
    if (current.branch) crumbs.push({ label: `${current.branch} Branch`, branch: current.branch, floor: "", manager: "", teamLeader: "" });
    if (current.floor) crumbs.push({ label: formatFloor(current.floor), branch: current.branch, floor: current.floor, manager: "", teamLeader: "" });
    if (current.manager) {
        const manager = members.find(user => user.role === "manager" && user.id === current.manager);
        crumbs.push({ label: manager?.name || current.manager, branch: current.branch, floor: current.floor, manager: current.manager, teamLeader: "" });
    }
    if (current.teamLeader) {
        const leader = members.find(user => user.role === "tl" && user.id === current.teamLeader);
        crumbs.push({ label: leader?.name || current.teamLeader, branch: current.branch, floor: current.floor, manager: current.manager, teamLeader: current.teamLeader });
    }
    breadcrumbs.innerHTML = crumbs.map((item, index) =>
        `${index ? '<span aria-hidden="true">›</span>' : ""}<button type="button" data-hq-crumb="${index}">${escapeHTML(item.label)}</button>`
    ).join("");
    breadcrumbs.querySelectorAll("[data-hq-crumb]").forEach(button => {
        button.addEventListener("click", () => {
            const item = crumbs[Number(button.dataset.hqCrumb)];
            performanceDrill = { branch: item.branch, floor: item.floor, manager: item.manager, teamLeader: item.teamLeader };
            renderPerformanceLoanAmounts();
        });
    });

    const branchNames = [...new Map([
        ...portalBranches,
        ...members.map(user => user.branch),
        ...data.map(branchFor)
    ].map(name => String(name || "").trim()).filter(Boolean).map(name => [name.toLowerCase(), name])).values()]
        .sort((first, second) => first.localeCompare(second));

    let entries = [];
    let chartTitle = "Branch performance";
    let cardTitle = "Branch";
    if (!current.branch) {
        entries = branchNames.map(branch => ({
            label: `${branch} Branch`, records: recordsForBranch(branch), action: "branch", value: branch, detail: "Open branch floors"
        }));
    } else if (current.teamLeader) {
        const leader = members.find(user => user.role === "tl" && user.id === current.teamLeader);
        chartTitle = `Agent performance · ${leader?.name || "Team Leader"}`;
        cardTitle = "Agent";
        entries = leader ? agentsForTeam(leader, current.branch, current.floor).map(agent => ({
            label: agent.name, records: data.filter(customer => resolveCustomerAgentId(customer.agentId) === agent.id &&
                sameValue(branchFor(customer), current.branch) && (current.floor === "__unassigned__"
                    ? !String(floorFor(customer)).trim() : sameValue(floorFor(customer), current.floor))), detail: `Agent · ${agent.id}`
        })) : [];
    } else if (current.manager) {
        const manager = members.find(user => user.role === "manager" && user.id === current.manager);
        chartTitle = `Team performance · ${manager?.name || "Branch Manager"}`;
        cardTitle = "Team Leader";
        const managerTeamLeaders = teamLeadersFor(current.branch, current.floor);
        entries = managerTeamLeaders.map(leader => ({
            label: `${leader.name} · ${leader.team || "Team"}`,
            records: data.filter(customer => sameValue(branchFor(customer), current.branch) &&
                sameValue(memberFor(customer)?.team, leader.team) && (current.floor === "__unassigned__"
                    ? !String(floorFor(customer)).trim() : sameValue(floorFor(customer), current.floor))),
            action: "leader", value: leader.id, detail: `Team Leader · ${leader.id}`
        }));
        if (!entries.length) {
            chartTitle = `Agent performance · ${manager?.name || "Branch Manager"}`;
            cardTitle = "Agent";
            entries = members.filter(user => user.role === "agent" && sameValue(user.branch, current.branch) &&
                (current.floor === "__unassigned__" ? !String(user.floor || "").trim() : sameValue(user.floor, current.floor)))
                .map(agent => ({
                    label: agent.name,
                    records: data.filter(customer => resolveCustomerAgentId(customer.agentId) === agent.id && sameValue(branchFor(customer), current.branch)),
                    detail: `Agent · ${agent.id}`
                }));
        }
    } else if (current.floor) {
        const managers = members.filter(user => user.role === "manager" && assignedFloorMatches(user, current.branch, current.floor));
        const leaders = teamLeadersFor(current.branch, current.floor);
        const floorRecords = recordsForScope(current.branch, current.floor);
        if (managers.length) {
            chartTitle = `Manager performance · ${formatFloor(current.floor)}`;
            cardTitle = "Branch Manager";
            entries = managers.map(manager => ({
                label: manager.name, records: floorRecords, action: "manager", value: manager.id, detail: `Manager · ${manager.id}`
            }));
        } else if (leaders.length) {
            chartTitle = `Team performance · ${formatFloor(current.floor)}`;
            cardTitle = "Team Leader";
            entries = leaders.map(leader => ({
                label: `${leader.name} · ${leader.team || "Team"}`,
                records: floorRecords.filter(customer => sameValue(memberFor(customer)?.team, leader.team)),
                action: "leader", value: leader.id, detail: `Team Leader · ${leader.id}`
            }));
        } else {
            chartTitle = `Agent performance · ${formatFloor(current.floor)}`;
            cardTitle = "Agent";
            entries = members.filter(user => user.role === "agent" && assignedFloorMatches(user, current.branch, current.floor)).map(agent => ({
                label: agent.name,
                records: floorRecords.filter(customer => resolveCustomerAgentId(customer.agentId) === agent.id),
                detail: `Agent · ${agent.id}`
            }));
        }
    } else {
        chartTitle = `Floor performance · ${current.branch} Branch`;
        cardTitle = "Floor";
        const branchMembers = members.filter(user => ["agent", "tl", "manager"].includes(user.role) && sameValue(user.branch, current.branch));
        const floorNames = [...new Set([
            ...branchMembers.map(user => String(user.floor || "").trim()),
            ...recordsForBranch(current.branch).map(customer => String(floorFor(customer) || "").trim())
        ].filter(Boolean))].sort((first, second) => first.localeCompare(second));
        if (branchMembers.some(user => !String(user.floor || "").trim()) ||
            recordsForBranch(current.branch).some(customer => !String(floorFor(customer) || "").trim()) || !floorNames.length) {
            floorNames.push("__unassigned__");
        }
        entries = floorNames.map(floor => ({
            label: formatFloor(floor), records: recordsForScope(current.branch, floor), action: "floor", value: floor,
            detail: `${branchMembers.filter(user => assignedFloorMatches(user, current.branch, floor)).length} team member(s)`
        }));
    }

    // Clustered horizontal bar chart: one group per branch / floor / manager / TL / agent,
    // one bar per status. Lives in the right-hand column next to the performance cards.
    const chartMarkup = entries.length ? (() => {
        const groups = entries.map(entry => ({
            entry,
            bars: stages
                .map(stage => ({ stage, count: countStatus(entry.records, stage.statuses) }))
                .filter(bar => bar.count > 0)
        }));
        const grandTotal = entries.reduce((sum, entry) => sum + entry.records.length, 0);
        const heading = `<div class="hq-chart-heading"><div><span class="hq-eyebrow">PORTFOLIO OVERVIEW</span><h3>${escapeHTML(chartTitle)}</h3></div><span class="hq-chart-count">${entries.length} ${escapeHTML(cardTitle.toLowerCase())}${entries.length === 1 ? "" : "s"}</span></div>`;
        if (!grandTotal) {
            return `<div class="hq-chart-panel">${heading}<div class="hq-chart-nodata"><strong>No applications yet</strong><span>Bars will appear here as soon as customers are assigned and worked on.</span></div></div>`;
        }

        const width = 440;
        const chartLeft = 4;
        const chartRight = 34;
        const plotWidth = width - chartLeft - chartRight;
        const barHeight = 16;
        const barGap = 4;
        const groupGap = 24;
        const titleHeight = 24;
        const maxCount = Math.max(1, ...groups.flatMap(group => group.bars.map(bar => bar.count)));
        const rawStep = maxCount / 5;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalized = rawStep / magnitude;
        const step = Math.max(1, (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude);
        const niceMax = Math.ceil(maxCount / step) * step;

        let y = 6;
        const groupMarkup = groups.map(group => {
            const label = group.entry.label.length > 30 ? `${group.entry.label.slice(0, 28)}…` : group.entry.label;
            const titleY = y + 14;
            y += titleHeight;
            const barsMarkup = group.bars.length
                ? group.bars.map(bar => {
                    const barWidth = Math.max(3, (bar.count / niceMax) * plotWidth);
                    const markup = `<rect x="${chartLeft}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3" fill="${bar.stage.color}"><title>${escapeHTML(group.entry.label)} · ${escapeHTML(bar.stage.label)}: ${bar.count}</title></rect><text x="${chartLeft + barWidth + 6}" y="${y + barHeight - 4}" class="hq-chart-total">${bar.count}</text>`;
                    y += barHeight + barGap;
                    return markup;
                }).join("")
                : (() => {
                    const markup = `<text x="${chartLeft}" y="${y + 12}" class="hq-chart-label">No applications yet</text>`;
                    y += barHeight + barGap;
                    return markup;
                })();
            y += groupGap - barGap;
            return `<text x="${chartLeft}" y="${titleY}" class="hq-chart-group-title">${escapeHTML(label)}<tspan class="hq-chart-group-total" dx="8">${group.entry.records.length} total</tspan></text>${barsMarkup}`;
        }).join("");
        const axisY = y - groupGap + 6;
        const ticks = [];
        for (let value = 0; value <= niceMax + 0.0001; value += step) {
            const x = chartLeft + (value / niceMax) * plotWidth;
            ticks.push(`<line x1="${x}" y1="0" x2="${x}" y2="${axisY}" class="hq-chart-grid"/><text x="${x}" y="${axisY + 15}" text-anchor="${value === 0 ? "start" : "middle"}" class="hq-chart-tick">${value}</text>`);
        }
        const chartHeight = axisY + 22;
        const usedStages = stages.filter(stage => groups.some(group => group.bars.some(bar => bar.stage === stage)));
        const legend = usedStages.map(stage => `<span><i style="background:${stage.color}"></i>${escapeHTML(stage.label)}</span>`).join("");
        return `<div class="hq-chart-panel">${heading}<div class="hq-chart-summary"><div><strong>${grandTotal}</strong><span>Applications</span></div><div><strong>${entries.reduce((s, e) => s + countStatus(e.records, ["Eligible", "Approved"]), 0)}</strong><span>Eligible / Approved</span></div><div><strong>${entries.reduce((s, e) => s + countStatus(e.records, ["Disbursed"]), 0)}</strong><span>Disbursed</span></div></div><div class="hq-chart-scroll"><svg class="hq-performance-chart" viewBox="0 0 ${width} ${chartHeight}" role="img" aria-label="${escapeHTML(chartTitle)} application count by status">${ticks.join("")}${groupMarkup}</svg></div><div class="hq-chart-axis-title">Number of applications</div><div class="hq-chart-legend">${legend}</div></div>`;
    })() : `<div class="hq-chart-panel hq-chart-empty"><span class="hq-eyebrow">PORTFOLIO OVERVIEW</span><h3>${escapeHTML(chartTitle)}</h3><p>No performance data is available at this level yet.</p></div>`;

    const cards = entries.map(entry => {
        const records = entry.records;
        const count = statuses => countStatus(records, statuses);
        const loanTotal = records.reduce((sum, customer) => sum + Number(customer.loanAmount || 0), 0);
        const amountOf = status => records
            .filter(customer => normalizeCustomerStatus(customer.status) === status)
            .reduce((sum, customer) => sum + Number(customer.loanAmount || 0), 0);
        const pending = count(pendingStage.statuses);
        const approved = count(approvedStage.statuses);
        return `<article class="performance-card hq-performance-card${entry.action ? " performance-card-clickable" : ""}" ${entry.action ? `role="button" tabindex="0" data-hq-action="${entry.action}" data-hq-value="${escapeHTML(entry.value)}"` : ""}>
            <div class="hq-card-heading"><div><span class="hq-eyebrow">${escapeHTML(entry.detail || cardTitle)}</span><h3>${escapeHTML(entry.label)}</h3></div><span class="hq-card-total">${records.length}</span></div>
            <div class="performance-progress" aria-label="Application status breakdown">${stages.map(stage => `<span title="${escapeHTML(stage.label)}: ${count(stage.statuses)}" style="width:${records.length ? count(stage.statuses) / records.length * 100 : 0}%;background:${stage.color}"></span>`).join("")}</div>
            <div class="performance-stat"><span>Customers</span><strong>${records.length}</strong></div>
            <div class="performance-stat"><span>Not Called</span><strong>${count(["Not Called"])}</strong></div>
            <div class="performance-stat"><span>Call Back</span><strong>${count(["Call Back"])}</strong></div>
            <div class="performance-stat"><span>Not Interested</span><strong>${count(["Not Interested"])}</strong></div>
            <div class="performance-stat"><span>Lead</span><strong>${count(["Lead"])}</strong></div>
            <div class="performance-stat"><span>Not Responded</span><strong>${count(["Not responded"])}</strong></div>
            <div class="performance-stat"><span>Pending / Review / Bank Processing</span><strong>${pending}</strong></div>
            <div class="performance-stat"><span>Eligible / Approved</span><strong>${approved}</strong></div>
            <div class="performance-stat"><span>Rejected</span><strong>${formatMoney(amountOf("Rejected"))}</strong></div>
            <div class="performance-stat"><span>Disbursed</span><strong>${formatMoney(amountOf("Disbursed"))}</strong></div>
            <div class="performance-stat"><span>Total Loan Amount</span><strong>${formatMoney(loanTotal)}</strong></div>
            ${entry.action ? '<span class="hq-card-drill">Explore details <span aria-hidden="true">→</span></span>' : ""}
        </article>`;
    }).join("");

    container.innerHTML = `<div class="hq-performance-layout"><div class="hq-performance-main"><div class="hq-performance-heading"><div><span class="hq-eyebrow">DETAILED BREAKDOWN</span><h3>${escapeHTML(cardTitle)} performance</h3></div><p>Select a card to drill into the next level.</p></div><div class="performance-grid hq-performance-grid">${cards || '<p class="history-empty">No teams or members are configured at this level.</p>'}</div></div><aside class="hq-performance-side">${chartMarkup}</aside></div>`;
    container.querySelectorAll("[data-hq-action]").forEach(card => {
        const activate = () => {
            const action = card.dataset.hqAction;
            const value = card.dataset.hqValue;
            if (action === "branch") performanceDrill = { branch: value, floor: "", manager: "", teamLeader: "" };
            if (action === "floor") performanceDrill = { ...performanceDrill, floor: value, manager: "", teamLeader: "" };
            if (action === "manager") performanceDrill = { ...performanceDrill, manager: value, teamLeader: "" };
            if (action === "leader") performanceDrill = { ...performanceDrill, teamLeader: value };
            renderPerformanceLoanAmounts();
        };
        card.addEventListener("click", activate);
        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); }
        });
    });
}

function openPerformanceLevel(action, value) {
    if (action === "branch") {
        performanceDrill = { branch: value, floor: "", manager: "", teamLeader: "" };
    } else if (action === "floor") {
        performanceDrill.floor = value;
        performanceDrill.manager = "";
        performanceDrill.teamLeader = "";
    } else if (action === "manager") {
        performanceDrill.manager = value;
        performanceDrill.floor = "";
        performanceDrill.teamLeader = "";
    } else if (action === "leader") {
        performanceDrill.teamLeader = value;
    }
    renderPerformanceLoanAmounts();
}

function resetPerformanceDrill() {
    performanceDrill = { branch: "", floor: "", manager: "", teamLeader: "" };
}

/* ================= NAVIGATION ================= */

function showSection(section) {
    if (currentUser?.role === "higher_management" && section !== "performance") return;
    if (currentUser?.role === "bank_backend" && section !== "bank-queue") return;

    document
        .getElementById("dashboardSection")
        .classList.add("hidden");

    document
        .getElementById("customersSection")
        .classList.add("hidden");

    document
        .getElementById("performanceSection")
        .classList.add("hidden");

    document
        .getElementById("leadsToApproveSection")
        .classList.add("hidden");

    document
        .getElementById("tlBankApplicationsSection")
        .classList.add("hidden");

    document
        .getElementById("tlApprovedApplicationsSection")
        .classList.add("hidden");

    document
        .getElementById("tlRejectedApplicationsSection")
        .classList.add("hidden");

    document
        .getElementById("bankQueueSection")
        .classList.add("hidden");

    document
        .getElementById("agentsSection")
        .classList.add("hidden");

    document
        .getElementById("branchesSection")
        .classList.add("hidden");


    document
        .querySelectorAll(".nav-item")
        .forEach(
            item =>
                item.classList.remove("active")
        );


    if (section === "dashboard") {

        document
            .getElementById("dashboardSection")
            .classList.remove("hidden");

        document.getElementById("pageTitle")
            .textContent = "Dashboard";

        document.getElementById("pageSubtitle")
            .textContent =
            `Welcome back, ${currentUser.name}`;

        document.getElementById("dashboardNav")?.classList.add("active");
        updateDashboard();

    }


    if (section === "customers") {

        document
            .getElementById("customersSection")
            .classList.remove("hidden");

        document.getElementById("pageTitle")
            .textContent = "Customers";

        document.getElementById("pageSubtitle")
            .textContent =
            "Customer loan applications";

        document.getElementById("customersNav")?.classList.add("active");
        clearDashboardMetricFilter();
        renderCustomers();
        renderAssignments();

    }


    if (section === "assignments") {
        showSection("customers");
        renderAssignments();
        return;
    }

    if (section === "leads-to-approve") {
        if (currentUser.role !== "tl") return;
        document.getElementById("leadsToApproveSection").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Leads to Approve";
        document.getElementById("pageSubtitle").textContent = "Review applications forwarded by your team";
        document.getElementById("leadsToApproveNav").classList.add("active");
        renderLeadsToApprove();
        return;
    }

    if (section === "tl-bank-applications") {
        if (currentUser.role !== "tl") return;
        document.getElementById("tlBankApplicationsSection").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Applications Sent to Bank";
        document.getElementById("pageSubtitle").textContent = "Track applications still being processed by the bank";
        document.getElementById("tlBankApplicationsNav").classList.add("active");
        renderTLBankApplications();
        return;
    }

    if (section === "tl-approved-applications" || section === "tl-rejected-applications") {
        if (currentUser.role !== "tl") return;
        const isApproved = section === "tl-approved-applications";
        const sectionId = isApproved ? "tlApprovedApplicationsSection" : "tlRejectedApplicationsSection";
        const navId = isApproved ? "tlApprovedApplicationsNav" : "tlRejectedApplicationsNav";
        const title = isApproved ? "Bank-Approved Applications" : "Bank-Rejected Applications";
        document.getElementById(sectionId).classList.remove("hidden");
        document.getElementById("pageTitle").textContent = title;
        document.getElementById("pageSubtitle").textContent = `Applications you forwarded that the bank marked ${isApproved ? "approved" : "rejected"}`;
        document.getElementById(navId).classList.add("active");
        renderTLBankApplications();
        return;
    }

    if (section === "bank-queue") {
        if (currentUser.role !== "bank_backend") return;
        document.getElementById("bankQueueSection").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Bank Applications";
        document.getElementById("pageSubtitle").textContent = `${currentUser.bankName} · applications approved by team leaders`;
        renderBankApplications();
        document.getElementById("bankQueueNav").classList.add("active");
        return;
    }

    if (section === "performance") {

        if (
            currentUser.role !== "tl" &&
            currentUser.role !== "manager" &&
            currentUser.role !== "backend" &&
            currentUser.role !== "assigner" &&
            currentUser.role !== "higher_management"
        ) return;


        document
            .getElementById("performanceSection")
            .classList.remove("hidden");
        document.getElementById("performanceNav")?.classList.add("active");

        const isHigherManagement = currentUser.role === "higher_management";
        document.getElementById("pageTitle")
            .textContent = isHigherManagement ? "Executive Performance" : "Team Performance";
        document.querySelector("#performanceSection .section-header h2")
            .textContent = isHigherManagement ? "Organization Performance" : "Team Performance";
        document.querySelector("#performanceSection .section-header p")
            .textContent = isHigherManagement
                ? "A high-level view of branch, floor, manager, team leader, and agent outcomes"
                : "Monitor your team's application activity";
        document.getElementById("pageSubtitle")
            .textContent = isHigherManagement
                ? "Organization-wide performance · read-only"
                : "Application performance overview";

        resetPerformanceDrill();
        renderPerformanceLoanAmounts();

    }

    if (section === "branches") {
        if (currentUser.role !== "backend") return;
        document.getElementById("branchesSection").classList.remove("hidden");
        document.getElementById("branchesNav").classList.add("active");
        document.getElementById("pageTitle").textContent = "Manage Branches";
        document.getElementById("pageSubtitle").textContent = "Add and remove branches for portal assignments";
        renderBranchManagement();
        return;
    }

    const managementPages = {
        agents: { role: "agent", title: "Manage Agents", label: "Agent" },
        "team-leaders": { role: "tl", title: "Manage Team Leaders", label: "Team Leader" },
        managers: { role: "manager", title: "Manage Managers", label: "Manager" },
        assigners: { role: "assigner", title: "Manage Assigners", label: "Assigner" },
        "bank-backends": { role: "bank_backend", title: "Manage Bank Backends", label: "Bank Backend" },
        "higher-management": { role: "higher_management", title: "Manage Higher Management", label: "Higher Management" }
    };
    const managementPage = managementPages[section];

    if (managementPage) {
        if (currentUser.role !== "backend" && !(currentUser.role === "manager" && managementPage.role === "agent")) return;

        currentManagementPage = managementPage.role;
        const membersNavGroup = document.getElementById("membersNavGroup");
        if (membersNavGroup) membersNavGroup.open = true;
        const managementNavIds = {
            agent: "agentsNav",
            tl: "teamLeadersNav",
            manager: "managersNav",
            assigner: "assignersNav",
            bank_backend: "bankBackendsNav",
            higher_management: "higherManagementNav"
        };
        document.getElementById(managementNavIds[managementPage.role])?.classList.add("active");
        document.getElementById("agentsSection").classList.remove("hidden");
        renderBranchManagement();
        document.getElementById("pageTitle").textContent = managementPage.title;
        document.getElementById("pageSubtitle").textContent = `Create and manage ${managementPage.label.toLowerCase()} accounts`;

        const isAssignerPage = managementPage.role === "assigner";
        document.querySelector("#agentsSection .agent-table-container")?.classList.toggle("hidden", isAssignerPage);
        document.getElementById("assignerManagementPanel")?.classList.toggle("hidden", !isAssignerPage || currentUser.role !== "backend");
        document.getElementById("editAgentPanel")?.classList.add("hidden");

        const roleSelect = document.getElementById("newAgentRole");
        if (roleSelect) {
            roleSelect.value = managementPage.role;
            roleSelect.disabled = true;
        }
        updateMemberRoleFields();
        const nameLabel = document.querySelector('label[for="newAgentName"]');
        if (nameLabel) nameLabel.textContent = `${managementPage.label} Name`;
        const addButton = document.querySelector("#agentForm button[type='submit']");
        if (addButton) addButton.textContent = `+ Add ${managementPage.label}`;

        renderAgents();
    }

}


/* ================= DASHBOARD ================= */

function clearDashboardMetricFilter() {
    dashboardCustomerStatuses = null;
}

function openDashboardCustomers(metric) {
    const metricStatuses = {
        "not-called": ["Not Called"],
        pending: ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"],
        rejected: ["Rejected"],
        "approved-loan": ["Eligible", "Approved"],
        "not-interested-loan": ["Not Interested"],
        "lead-loan": ["Lead"],
        "pending-loan": ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"],
        "rejected-loan": ["Rejected"],
        disbursed: ["Disbursed"]
    };

    const selectedStatuses = metric === "all" ? null : metricStatuses[metric] || null;

    ["Name", "Phone", "Cibil", "Loan", "Place", "Location"].forEach(field => {
        const input = document.getElementById(`customerFilter${field}`);
        if (input) input.value = "";
    });
    document.getElementById("statusFilter").value = "all";
    document.getElementById("assignmentAssigneeFilter").value = "all";
    document.getElementById("assignmentStatusFilter").value = "all";

    showSection("customers");
    dashboardCustomerStatuses = selectedStatuses;
    const label = metric === "all" ? "All customers" : `Dashboard: ${metric.replace(/-/g, " ")} customers`;
    document.getElementById("pageSubtitle").textContent = `${label} · agent and team leader details`;
    renderCustomers();
}

function openDashboardCustomersByStatus(status) {
    const selectedStatus = normalizeCustomerStatus(status);
    ["Name", "Phone", "Cibil", "Loan", "Place", "Location"].forEach(field => {
        const input = document.getElementById(`customerFilter${field}`);
        if (input) input.value = "";
    });
    document.getElementById("statusFilter").value = "all";
    document.getElementById("assignmentAssigneeFilter").value = "all";
    document.getElementById("assignmentStatusFilter").value = "all";

    showSection("customers");
    dashboardCustomerStatuses = [selectedStatus];
    document.getElementById("pageSubtitle").textContent =
        `Dashboard: ${selectedStatus} customers · agent and team leader details`;
    renderCustomers();
}

function enableDashboardStatusDrilldown() {
    const statusBars = document.querySelector("#dashboardSection .status-bars");
    if (!statusBars) return;

    let currentStatus = "";
    Array.from(statusBars.children).forEach(element => {
        if (element.classList.contains("status-row")) {
            currentStatus = element.querySelector("span")?.textContent.trim() || "";
        }
        if (!currentStatus || !element.matches(".status-row, .progress")) return;
        const drilldownStatus = currentStatus;

        element.classList.add("status-drilldown");
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", `Show customers with status ${drilldownStatus}`);
        element.onclick = () => openDashboardCustomersByStatus(drilldownStatus);
        element.onkeydown = event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDashboardCustomersByStatus(drilldownStatus);
            }
        };
    });
}

function ensureNotCalledStatusRow() {
    const statusBars = document.querySelector(".status-bars");
    if (!statusBars || document.getElementById("statusNotCalled")) return;

    const pendingRow = document.getElementById("statusPending")?.closest(".status-row");
    const pendingBar = document.getElementById("pendingBar")?.closest(".progress");

    if (!pendingRow || !pendingBar) return;

    const notCalledRow = document.createElement("div");
    notCalledRow.className = "status-row";
    notCalledRow.innerHTML = '<span>Not Called</span><strong id="statusNotCalled">0</strong>';

    const notCalledBar = document.createElement("div");
    notCalledBar.className = "progress";
    notCalledBar.innerHTML = '<div id="notCalledBar"></div>';

    statusBars.insertBefore(notCalledRow, pendingRow);
    statusBars.insertBefore(notCalledBar, pendingRow);
}

function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function localDateTimeInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function matchesDateTimeRange(customer, fromValue, toValue, getDate = getCustomerCreatedDate) {
    if (!fromValue && !toValue) return true;
    const date = getDate(customer);
    if (!date) return false;

    const timestamp = date.getTime();
    const start = fromValue ? new Date(fromValue).getTime() : -Infinity;
    const end = toValue ? new Date(toValue).getTime() + 59999 : Infinity;
    return Number.isFinite(timestamp) && start <= end && timestamp >= start && timestamp <= end;
}

function dateKeyOrdinal(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return Date.UTC(year, month - 1, day) / 86400000;
}

function getCustomerCreatedDate(customer) {
    if (customer.createdAt) {
        const createdAt = new Date(customer.createdAt);
        if (!Number.isNaN(createdAt.getTime())) return createdAt;
    }

    const createdActivity = Array.isArray(customer.activityHistory)
        ? customer.activityHistory.find(entry => entry.type === "created")
        : null;
    if (!createdActivity?.at) return null;

    const createdAt = new Date(createdActivity.at);
    return Number.isNaN(createdAt.getTime()) ? null : createdAt;
}

function getCustomerForwardedDate(customer) {
    const forwardedAt = customer?.forwardedAt || customer?.reviewedAt;
    if (!forwardedAt) return getCustomerCreatedDate(customer);
    const date = new Date(forwardedAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getCustomerBankForwardedDate(customer) {
    const forwardedAt = customer?.bankForwardedAt || customer?.reviewedAt;
    if (!forwardedAt) return getCustomerCreatedDate(customer);
    const date = new Date(forwardedAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

function updateDashboardDateFilter() {
    const preset = document.getElementById("dashboardDatePreset")?.value;
    const rangeElement = document.getElementById("dashboardCustomDateRange");
    const startInput = document.getElementById("dashboardDateStart");
    const endInput = document.getElementById("dashboardDateEnd");
    const message = document.getElementById("dashboardDateFilterMessage");
    if (!preset || !rangeElement || !startInput || !endInput || !message) return;

    const nowValue = localDateTimeInputValue(new Date());
    startInput.max = nowValue;
    endInput.max = nowValue;
    rangeElement.classList.toggle("hidden", preset !== "custom");
    message.textContent = "Choose a period, then click Search to apply it.";
}

function getDashboardDateBounds(filter) {
    if (filter.preset === "all") return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, -1);
    let start = startOfToday;
    let end = endOfToday;

    if (filter.preset === "yesterday") {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, -1);
    } else if (filter.preset === "last7" || filter.preset === "last30") {
        const days = filter.preset === "last7" ? 7 : 30;
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + 1);
    } else if (filter.preset === "custom") {
        start = new Date(filter.start);
        end = new Date(filter.end);
        end.setSeconds(59, 999);
    }

    return { start, end };
}

function applyDashboardDateFilter() {
    const preset = document.getElementById("dashboardDatePreset")?.value || "all";
    const startInput = document.getElementById("dashboardDateStart");
    const endInput = document.getElementById("dashboardDateEnd");
    const message = document.getElementById("dashboardDateFilterMessage");
    if (!message) return;

    if (preset === "custom") {
        const start = startInput?.value || "";
        const end = endInput?.value || "";
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();
        if (!start || !end) {
            message.textContent = "Choose both date and time values, then click Search.";
            return;
        }
        const rangeLength = endDate.getTime() - startDate.getTime();
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || rangeLength < 0 || endDate > now || rangeLength > 31 * 86400000) {
            message.textContent = "Choose a valid date and time range of no more than 31 days, ending now or earlier.";
            return;
        }
        dashboardStatusDateFilter = { preset, start, end };
    } else {
        dashboardStatusDateFilter = { preset, start: "", end: "" };
    }

    const bounds = getDashboardDateBounds(dashboardStatusDateFilter);
    message.textContent = bounds
        ? `Applied: ${formatActivityDate(bounds.start)} to ${formatActivityDate(bounds.end)}.`
        : "Applied: all time. Applications without a creation date are included.";
    updateDashboard();
}

function getDashboardStatusCustomers(customersForDashboard) {
    const bounds = getDashboardDateBounds(dashboardStatusDateFilter);
    if (!bounds) return customersForDashboard;

    return customersForDashboard.filter(customer => {
        const createdAt = getCustomerCreatedDate(customer);
        if (!createdAt) return false;
        return createdAt >= bounds.start && createdAt <= bounds.end;
    });
}

function updateDashboard() {

    const data =
        getVisibleCustomers();
    const statusData = getDashboardStatusCustomers(data);
    const statusTotal = statusData.length;
    const statusDescription = document.getElementById("applicationStatusDescription");
    const undatedCount = document.getElementById("dashboardUndatedCount");
    if (statusDescription) {
        const roleScope = {
            agent: "your applications",
            tl: "your team's applications",
            manager: "your branch's applications",
            assigner: "all applications",
            bank_backend: "your bank's applications",
            backend: "all applications"
        }[currentUser?.role] || "your applications";
        statusDescription.textContent = dashboardStatusDateFilter.preset === "all"
            ? `Current status of ${roleScope} · all time`
            : `Current status of ${roleScope} created in the selected period`;
    }
    if (undatedCount) {
        const missingDateCount = dashboardStatusDateFilter.preset === "all"
            ? 0
            : data.filter(customer => !getCustomerCreatedDate(customer)).length;
        undatedCount.textContent = missingDateCount
            ? `${missingDateCount} application(s) have no creation date and are excluded from these counts.`
            : "";
        undatedCount.classList.toggle("hidden", missingDateCount === 0);
    }
    const dateResults = document.getElementById("dashboardDateResults");
    if (dateResults) {
        const dateLabel = dashboardStatusDateFilter.preset === "all" ? "in all time" : "in the applied date range";
        dateResults.textContent = `${statusTotal} application${statusTotal === 1 ? "" : "s"} ${dateLabel}.`;
    }

    ensureNotCalledStatusRow();
    enableDashboardStatusDrilldown();

    const total =
        data.length;

    const allTimeNotCalled =
        data.filter(c => normalizeCustomerStatus(c.status) === "Not Called").length;

    const notCalled =
        statusData.filter(c => normalizeCustomerStatus(c.status) === "Not Called").length;

    const pending =
        data.filter(
            c => ["Pending", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending"].includes(normalizeCustomerStatus(c.status))
        ).length;
    const regularPending = statusData.filter(c =>
        normalizeCustomerStatus(c.status) === "Pending"
    ).length;
    const extraStatusElements = {
        "Call Back": { count: "statusCallBack", bar: "callBackBar", color: "#14b8a6" },
        "Not Eligible": { count: "statusNotEligible", bar: "notEligibleBar", color: "#7c3aed" },
        "Not responded": { count: "statusNotResponded", bar: "notRespondedBar", color: "#94a3b8" },
        "Not Interested": { count: "statusNotInterested", bar: "notInterestedBar", color: "#ef4444" },
        Lead: { count: "statusLead", bar: "leadBar", color: "#22c55e" },
        Review: { count: "statusReview", bar: "reviewBar", color: "#f59e0b" }
    };
    Object.entries(extraStatusElements).forEach(([status, elements]) => {
        const count = statusData.filter(c => normalizeCustomerStatus(c.status) === status).length;
        const countElement = document.getElementById(elements.count);
        const barElement = document.getElementById(elements.bar);
        if (countElement) countElement.textContent = count;
        if (barElement) {
            barElement.style.background = elements.color;
            barElement.style.width = `${statusTotal === 0 ? 0 : (count / statusTotal) * 100}%`;
        }
    });
    const bankStageCounts = {
        "TL Approved": statusData.filter(c => normalizeCustomerStatus(c.status) === "TL Approved").length,
        "Logged In": statusData.filter(c => normalizeCustomerStatus(c.status) === "Logged In").length,
        Underwriting: statusData.filter(c => normalizeCustomerStatus(c.status) === "Underwriting").length,
        "Documents Pending": statusData.filter(c => normalizeCustomerStatus(c.status) === "Documents Pending").length
    };


    const eligible =
        data.filter(
            c => normalizeCustomerStatus(c.status) === "Eligible"
        ).length;


    const Approved =
        data.filter(
            c => normalizeCustomerStatus(c.status) === "Approved"
        ).length;

    const rejected =
        data.filter(
            c => normalizeCustomerStatus(c.status) === "Rejected"
        ).length;

    const notInterestedLoanTotal = data
        .filter(c => normalizeCustomerStatus(c.status) === "Not Interested")
        .reduce((sum, c) => sum + Number(c.loanAmount || 0), 0);

    const leadApplicationsCount = data
        .filter(c => normalizeCustomerStatus(c.status) === "Lead")
        .length;

    const rejectedLoanTotal = data
        .filter(c => normalizeCustomerStatus(c.status) === "Rejected")
        .reduce((sum, c) => sum + Number(c.loanAmount || 0), 0);

    const disbursedLoanTotal = data
        .filter(c => normalizeCustomerStatus(c.status) === "Disbursed")
        .reduce((sum, c) => sum + Number(c.loanAmount || 0), 0);

    document
        .getElementById("totalCustomers")
        .textContent = total;

    document
        .getElementById("newCustomers")
        .textContent = allTimeNotCalled;

    document
        .getElementById("pendingCustomers")
        .textContent = pending;

    const rejectedCustomersStat = document.getElementById("rejectedCustomers");
    if (rejectedCustomersStat) {
        rejectedCustomersStat.textContent = rejected;
    }

    const eligibleCustomersStat = document.getElementById("eligibleCustomers");
    if (eligibleCustomersStat) {
        eligibleCustomersStat.textContent = eligible;
    }

    const notCalledStatus = document.getElementById("statusNotCalled");
    const notCalledBar = document.getElementById("notCalledBar");
    const statusEligibleCount = statusData.filter(c => normalizeCustomerStatus(c.status) === "Eligible").length;
    const statusApprovedCount = statusData.filter(c => normalizeCustomerStatus(c.status) === "Approved").length;
    const statusRejectedCount = statusData.filter(c => normalizeCustomerStatus(c.status) === "Rejected").length;
    const statusDisbursedCount = statusData.filter(c => normalizeCustomerStatus(c.status) === "Disbursed").length;

    if (notCalledStatus) {
        notCalledStatus.textContent = notCalled;
    }

    if (notCalledBar) {
        notCalledBar.style.background = "#2563eb";
        notCalledBar.style.width = (statusTotal === 0 ? 0 : (notCalled / statusTotal) * 100) + "%";
    }

    document
        .getElementById("statusPending")
        .textContent = regularPending;


    document
        .getElementById("statusEligible")
        .textContent = statusEligibleCount;


    document
        .getElementById("statusApproved")
        .textContent = statusApprovedCount;

    document
        .getElementById("statusRejected")
        .textContent = statusRejectedCount;

    document
        .getElementById("statusDisbursed")
        .textContent = statusDisbursedCount;

    const bankStageElements = {
        "TL Approved": { count: "statusBankTlApproved", bar: "bankTlApprovedBar", color: "#0ea5e9" },
        "Logged In": { count: "statusBankLoggedIn", bar: "bankLoggedInBar", color: "#6366f1" },
        Underwriting: { count: "statusBankUnderwriting", bar: "bankUnderwritingBar", color: "#8b5cf6" },
        "Documents Pending": { count: "statusBankDocumentsPending", bar: "bankDocumentsPendingBar", color: "#f59e0b" }
    };
    Object.entries(bankStageElements).forEach(([status, elements]) => {
        const count = bankStageCounts[status];
        const countElement = document.getElementById(elements.count);
        const barElement = document.getElementById(elements.bar);
        if (countElement) countElement.textContent = count;
        if (barElement) {
            barElement.style.background = elements.color;
            barElement.style.width = `${statusTotal === 0 ? 0 : (count / statusTotal) * 100}%`;
        }
    });

    document
        .getElementById("notInterestedLoanTotal")
        .textContent = formatMoney(notInterestedLoanTotal);

    document
        .getElementById("leadApplicationsCount")
        .textContent = leadApplicationsCount;

    document
        .getElementById("rejectedLoanTotal")
        .textContent = formatMoney(rejectedLoanTotal);

    document
        .getElementById("disbursedLoanTotal")
        .textContent = formatMoney(disbursedLoanTotal);


    document
        .getElementById("pendingBar")
        .style.width =
        (statusTotal === 0 ? 0 : (regularPending / statusTotal) * 100) + "%";


    document
        .getElementById("eligibleBar")
        .style.width =
        (
            statusTotal === 0
                ? 0
                : (statusEligibleCount / statusTotal) * 100
        ) + "%";


    document
        .getElementById("ApprovedBar")
        .style.width =
        (
            statusTotal === 0
                ? 0
                : (statusApprovedCount / statusTotal) * 100
        ) + "%";

    document
        .getElementById("rejectedBar")
        .style.width =
        (statusTotal === 0 ? 0 : (statusRejectedCount / statusTotal) * 100) + "%";

    document
        .getElementById("disbursedBar")
        .style.width =
        (statusTotal === 0 ? 0 : (statusDisbursedCount / statusTotal) * 100) + "%";


    renderRecentCustomers(data);

}


/* ================= RECENT CUSTOMERS ================= */

function renderRecentCustomers(data) {

    const container =
        document.getElementById(
            "recentCustomers"
        );


    if (data.length === 0) {

        container.innerHTML =
            "<p>No customers found.</p>";

        return;

    }


    container.innerHTML =
        [...data]
            .sort((a, b) =>
                (getCustomerCreatedDate(b)?.getTime() || Number(b.id) || 0) -
                (getCustomerCreatedDate(a)?.getTime() || Number(a.id) || 0)
            )
            .slice(0, 12)
            .map(
                c => {
                    const status = normalizeCustomerStatus(c.status);
                    const statusClass = escapeHTML(status.toLowerCase().replace(/\s+/g, "-"));
                    return `

                <a
                    class="customer-mini customer-mini-clickable"
                    href="#"
                    data-customer-id="${escapeHTML(c.id)}"
                    onclick="openCustomer(Number(this.dataset.customerId)); return false;"
                    aria-label="Open application for ${escapeHTML(c.name)}"
                >

                    <div class="customer-mini-info">

                        <div class="customer-avatar">
                            ${escapeHTML(getInitials(c.name || ""))}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(c.name)}
                            </strong>

                            <small>
                                ${formatMoney(c.loanAmount)}
                            </small>

                        </div>

                    </div>

                    <span class="status ${statusClass}">
                        ${escapeHTML(status)}
                    </span>

                </a>

            `;
                }
            )
            .join("");

}


/* ================= CUSTOMER FILTERS ================= */

function filterCustomers(data, prefix) {
    const value = suffix =>
        document.getElementById(`${prefix}Filter${suffix}`).value.trim().toLowerCase();

    const name = value("Name");
    const phone = value("Phone");
    const cibil = value("Cibil");
    const loan = value("Loan");
    const place = value("Place");
    const locationElement = document.getElementById(`${prefix}FilterLocation`);
    const location = locationElement ? locationElement.value.trim().toLowerCase() : "";
    const dateFrom = document.getElementById(`${prefix}FilterDateFrom`)?.value || "";
    const dateTo = document.getElementById(`${prefix}FilterDateTo`)?.value || "";

    return data.filter(customer =>
        matchesDateTimeRange(customer, dateFrom, dateTo) &&
        String(customer.name || "").toLowerCase().includes(name) &&
        String(customer.phone || "").toLowerCase().includes(phone) &&
        String(customer.cibil ?? "").toLowerCase().includes(cibil) &&
        String(customer.loanAmount ?? "").toLowerCase().includes(loan) &&
        String(customer.address || "").toLowerCase().includes(place) &&
        String(customer.location || "").toLowerCase().includes(location)
    );
}


/* ================= CUSTOMERS TABLE ================= */

function renderCustomers() {
    let filtered = getFilteredAssignmentCustomers();
    if (dashboardCustomerStatuses) {
        const metricStatuses = new Set(dashboardCustomerStatuses);
        filtered = filtered.filter(customer => metricStatuses.has(normalizeCustomerStatus(customer.status)));
    }
    const canManageAssignments = ["tl", "manager", "backend", "assigner"].includes(currentUser.role);
    const assignmentTargets = canManageAssignments ? getAssignmentTargets() : [];
    const selectionLimit = getAssignmentSelectionLimit();
    const selectableIds = selectionLimit === null
        ? null
        : new Set(filtered.slice(0, selectionLimit).map(customer => customer.id));

    const body =
        document.getElementById(
            "customerTableBody"
        );


    body.innerHTML =
        filtered.map(
            c => {

                const agent = resolveCustomerAgent(c);
                const normalizedAgentId = resolveCustomerAgentId(c.agentId);
                const teamLeader = agent?.team
                    ? users.find(user => user.role === "tl" && user.team === agent.team)
                    : null;
                const latestCall = Array.isArray(c.activityHistory)
                    ? [...c.activityHistory].reverse().find(entry => ["call", "remarks"].includes(entry.type))
                    : null;
                const agentOrCaller = latestCall?.by || agent?.name || "Unassigned";

                const selectionCell = canManageAssignments
                    ? `<td><input type="checkbox" class="customer-select" value="${c.id}" aria-label="Select ${escapeHTML(c.name)}" ${selectedCustomerIds.has(c.id) || selectedAssignmentCustomerIds.has(c.id) ? "checked" : ""} ${selectableIds && !selectableIds.has(c.id) ? "disabled" : ""} onchange="toggleCustomerSelection(${c.id}, this.checked)"></td>`
                    : "";
                const assignmentCell = canManageAssignments
                    ? `<select id="agent-${c.id}" class="row-assignment-select" aria-label="Assign ${escapeHTML(c.name)}">
                        <option value="" ${!c.agentId ? "selected" : ""}>Unassigned</option>
                        ${assignmentTargets.map(target => `
                            <option value="${escapeHTML(target.id)}" ${target.id === normalizedAgentId ? "selected" : ""}>
                                ${escapeHTML(target.name)} (${target.role.toUpperCase()})
                            </option>
                        `).join("")}
                    </select>
                    <button class="action-btn" type="button" onclick="reassignCustomer(${c.id})">Save</button>`
                    : "—";

                return `

                <tr>
                    ${selectionCell}

                    <td>

                        <span class="customer-name">
                            ${escapeHTML(c.name)}
                        </span>

                        <span class="customer-phone">
                            ${escapeHTML(c.phone ?? "")}
                        </span>

                    </td>

                    <td class="customer-remark" title="${escapeHTML(c.tlReturnComment ? `TL return reason: ${c.tlReturnComment}` : c.remarks || "No remark yet")}">
                        ${escapeHTML(c.remarks || "—")}
                        ${c.tlReturnComment ? `
                            <div class="tl-return-feedback">
                                <strong>TL return reason</strong>
                                <span>${escapeHTML(c.tlReturnComment)}</span>
                            </div>
                        ` : ""}
                    </td>

                    <td>
                        ${escapeHTML(c.location || "—")}
                    </td>

                    <td>
                        ${formatMoney(c.loanAmount)}
                    </td>

                    <td>
                        ${formatMoney(c.salary)}
                    </td>

                    <td>
                        <strong>${escapeHTML(c.cibil ?? "")}</strong>
                    </td>

                    <td>
                        ${formatMoney(c.btAmount)}
                    </td>

                    <td>
                        ${c.banksPushing
                            ? `<span class="customer-bank-name">${escapeHTML(bankNameForCustomer(c))}</span>`
                            : '<span class="customer-table-muted">Not selected</span>'}
                    </td>

                    <td class="customer-status-cell">

                        <span class="status ${escapeHTML(normalizeCustomerStatus(c.status).toLowerCase().replace(/\s+/g, "-"))}">
                            ${escapeHTML(normalizeCustomerStatus(c.status))}
                        </span>
                        ${c.approvalStatus === "approved" && c.bankStatus ? `
                            <div class="customer-bank-details">
                                ${c.bankApplicationNumber ? `
                                    <span class="customer-bank-detail">
                                        <span class="customer-bank-label">App #</span>
                                        <strong>${escapeHTML(c.bankApplicationNumber)}</strong>
                                    </span>
                                ` : ""}
                                ${c.bankStatusUpdatedAt ? `
                                    <span class="customer-bank-updated">
                                        Updated by ${escapeHTML(users.find(user => user.id === c.bankStatusUpdatedBy)?.name || c.bankStatusUpdatedBy || "Bank")}
                                        · ${escapeHTML(formatActivityDate(c.bankStatusUpdatedAt))}
                                    </span>
                                ` : ""}
                            </div>
                        ` : ""}

                    </td>

                    <td class="customer-bank-remark-cell">
                        ${c.bankRemarks
                            ? `<span class="customer-bank-update">${escapeHTML(c.bankRemarks)}</span>`
                            : '<span class="customer-table-muted">No bank remark yet</span>'}
                    </td>

                    <td>
                        ${escapeHTML(agentOrCaller)}
                        ${agent ? `<span class="customer-phone">Assigned: ${escapeHTML(agent.name)}</span>` : ""}
                    </td>

                    <td>
                        ${teamLeader ? escapeHTML(teamLeader.name) : "—"}
                    </td>

                    <td class="row-assignment-cell">
                        ${assignmentCell}
                    </td>

                    <td>

                        <a
                            class="action-btn"
                            href="#"
                            data-customer-id="${escapeHTML(c.id)}"
                            onclick="openCustomer(Number(this.dataset.customerId)); return false;"
                        >
                            View
                        </a>
                        ${["tl", "manager", "backend"].includes(currentUser.role) ? `
                            <button
                                class="delete-customer-btn"
                                onclick="removeCustomer(${c.id})"
                            >
                                Remove
                            </button>
                        ` : ""}

                    </td>

                </tr>

                `;

            }
        )
        .join("");


    if (filtered.length === 0) {

        body.innerHTML = `

            <tr>

                <td colspan="${canManageAssignments ? 15 : 14}"
                    style="text-align:center;padding:40px;">

                    No customers found.

                </td>

            </tr>

        `;

    }

    updateCustomerSelectionControls(filtered);
    updateAssignmentSelectionControls(filtered);

}

function toggleCustomerSelection(id, isSelected) {
    if (isSelected) selectedCustomerIds.add(id);
    else selectedCustomerIds.delete(id);
    if (isSelected) selectedAssignmentCustomerIds.add(id);
    else selectedAssignmentCustomerIds.delete(id);
    renderCustomers();
}

function toggleAllCustomers(checkbox) {
    let filteredCustomers = getFilteredAssignmentCustomers();
    if (dashboardCustomerStatuses) {
        const metricStatuses = new Set(dashboardCustomerStatuses);
        filteredCustomers = filteredCustomers.filter(customer => metricStatuses.has(normalizeCustomerStatus(customer.status)));
    }
    const selectionLimit = getAssignmentSelectionLimit();
    const visibleIds = (selectionLimit === null
        ? filteredCustomers
        : filteredCustomers.slice(0, selectionLimit)
    ).map(customer => customer.id);

    visibleIds.forEach(id => {
        if (checkbox.checked) {
            selectedCustomerIds.add(id);
            selectedAssignmentCustomerIds.add(id);
        } else {
            selectedCustomerIds.delete(id);
            selectedAssignmentCustomerIds.delete(id);
        }
    });
    renderCustomers();
}

function updateCustomerSelectionControls(visibleCustomers) {
    const selectedVisible = visibleCustomers.filter(customer => selectedCustomerIds.has(customer.id)).length;
    const selectedAccessible = getVisibleCustomers().filter(customer => selectedCustomerIds.has(customer.id)).length;
    const button = document.getElementById("bulkRemoveCustomersButton");
    const selectAll = document.getElementById("selectAllCustomers");

    button.textContent = `Remove Selected (${selectedAccessible})`;
    button.disabled = selectedAccessible === 0;
    selectAll.checked = visibleCustomers.length > 0 && selectedVisible === visibleCustomers.length;
    selectAll.indeterminate = selectedVisible > 0 && selectedVisible < visibleCustomers.length;
}


/* ================= REMOVE CUSTOMER ================= */

function removeCustomer(id) {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!["tl", "manager", "backend"].includes(role)) {
        alert("You don't have permission to remove customers.");
        return;
    }

    const customer = customers.find(c => c.id === id);
    if (!customer || !getVisibleCustomers().some(c => c.id === id)) {
        alert("You don't have permission to remove this customer.");
        return;
    }

    if (!confirm(`Remove customer ${customer.name}? This action cannot be undone.`)) {
        return;
    }

    customers = customers.filter(c => c.id !== id);
    selectedCustomerIds.delete(id);
    selectedAssignmentCustomerIds.delete(id);
    saveData();
    renderCustomers();
    updateDashboard();
}

function removeSelectedCustomers() {
    if (!currentUser || !["tl", "manager", "backend"].includes(currentUser.role)) {
        alert("You don't have permission to remove customers.");
        return;
    }

    const accessibleIds = new Set(getVisibleCustomers().map(customer => customer.id));
    const selectedIds = [...selectedCustomerIds].filter(id => accessibleIds.has(id));
    if (selectedIds.length === 0) return;

    if (!confirm(`Remove ${selectedIds.length} selected customer(s)? This action cannot be undone.`)) {
        return;
    }

    const removedIds = new Set(selectedIds);
    customers = customers.filter(customer => !removedIds.has(customer.id));
    selectedCustomerIds.clear();
    selectedAssignmentCustomerIds.clear();
    saveData();
    renderCustomers();
    updateDashboard();
}


/* ================= OPEN CUSTOMER ================= */

function updateForwardTLMessage() {
    const message = document.getElementById("forwardToTLMessage");
    const button = document.getElementById("forwardCustomerToTLButton");
    if (!message || !button) return;

    if (currentUser?.role !== "agent") {
        message.classList.add("hidden");
        button.classList.add("hidden");
        return;
    }

    const teamLeader = users.find(user =>
        user.role === "tl" && teamsMatch(user.team, currentUser.team)
    );
    message.textContent = teamLeader
        ? `Forwarding sends this application and its uploaded document details to ${teamLeader.name} (${teamLeader.id}).`
        : `No team leader is configured for ${currentUser.team || "your team"}; forwarding is unavailable.`;
    message.classList.remove("hidden");
    button.classList.toggle("hidden", !teamLeader);
    button.disabled = !teamLeader ||
        normalizeCustomerStatus(document.getElementById("customerStatus")?.value) !== "Lead";
}

document.getElementById("customerStatus")?.addEventListener("change", updateForwardTLMessage);

function openCustomer(id) {

    const customer =
        customers.find(
            c => c.id === id
        );


    if (!customer) return;


    /* Permission check */

    if (
        !getVisibleCustomers()
            .some(c => c.id === id)
    ) {

        alert(
            "You don't have permission to view this customer."
        );

        return;

    }


    document
        .getElementById("modalTitle")
        .textContent =
        "Customer Application";


    document
        .getElementById("customerId")
        .value =
        customer.id;


    fillCustomerForm(customer);
    renderCustomerBankSummary(customer);
    renderCustomerHistory(customer);
    selectedCustomerDocumentIds.clear();
    renderCustomerDocuments(customer);
    updateCallbackNotificationStatus();
    updateForwardTLMessage();
    // Bank backend users can read the file and download documents, but update
    // the application only through the Bank Applications page.
    setCustomerModalReadOnly(currentUser.role === "bank_backend");


    document
        .getElementById("customerModal")
        .classList.remove("hidden");

}

function openCustomerSheetInNewTab(event, id) {
    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(id));
    if (!customer) {
        alert("This application is not available to your account.");
        return false;
    }

    const value = item => item === null || item === undefined || String(item).trim() === ""
        ? "—"
        : escapeHTML(item);
    const editableFields = {
        "Age": "age",
        "Mobile Number": "phone",
        "Personal Email-ID": "personalEmail",
        "CIBIL Score": "cibil",
        "Location / State Code": "location",
        "Present Address": "address",
        "Permanent Address": "permanentAddress",
        "Mother Name": "motherName",
        "Spouse Name": "spouseName",
        "Company Name": "companyName",
        "Office Email-ID": "officeEmail",
        "Office Address": "officeAddress",
        "Salary": "salary",
        "Company Listed Bank": "companyBank",
        "Loan Amount": "loanAmount",
        "BT Amount": "btAmount",
        "BT Bank": "btBank",
        "In-Hand Loan Amount": "inHandAmount",
        "Bank(s) Already Applied": "banksApplied",
        "Bank Being Pushed": "banksPushing",
        "Number of Enquiries": "enquiries",
        "Credit Cards Used": "creditCards",
        "Delay Payments": "delays",
        ...Object.fromEntries(OUTSTANDING_LOAN_FIELDS.map(item => [item.label, item.key])),
        ...Object.fromEntries(EMI_LOAN_FIELDS.map(item => [item.label, item.key])),
        "Other EMI": "otherEmi",
        "Application Status": "status",
        "Bank Status": "bankStatus",
        "Bank Application Number": "bankApplicationNumber",
        "Bank Remark": "bankRemarks",
        "Call Remark": "remarks",
        "Callback Reminder": "callbackAt"
    };
    const numericFields = new Set([
        "age", "cibil", "salary", "loanAmount", "btAmount", "inHandAmount",
        "enquiries", ...OUTSTANDING_LOAN_KEYS, ...EMI_LOAN_KEYS, "otherEmi"
    ]);
    const field = (label, item, forcedType = "") => {
        const key = editableFields[label];
        if (!key) return `
            <div class="field"><span>${escapeHTML(label)}</span><strong>${value(item)}</strong></div>
        `;
        if (key === "status") {
            const statuses = [
                "Not Called", "Call Back", "Not responded", "Not Interested", "Lead",
                "Pending", "Eligible", "Review", "Approved", "Rejected", "Disbursed",
                "TL Approved", "Logged In", "Underwriting", "Documents Pending"
            ];
            const selectedStatus = normalizeCustomerStatus(item);
            return `
                <label class="field">
                    <span>${escapeHTML(label)}</span>
                    <select data-customer-field="${key}">
                        ${statuses.map(status => `
                            <option value="${escapeHTML(status)}" ${status === selectedStatus ? "selected" : ""}>${escapeHTML(status)}</option>
                        `).join("")}
                    </select>
                </label>
            `;
        }
        const type = forcedType || (key === "callbackAt" ? "datetime-local" : key === "personalEmail" || key === "officeEmail" ? "email" : numericFields.has(key) ? "number" : "text");
        const fieldValue = key === "callbackAt" ? toDateTimeLocalValue(customer.callbackAt) : item ?? "";
        return `
            <label class="field">
                <span>${escapeHTML(label)}</span>
                <input data-customer-field="${key}" type="${type}" value="${escapeHTML(fieldValue)}" ${type === "number" ? 'step="any"' : ""}>
            </label>
        `;
    };
    const moneyField = (label, amount) => field(label, amount ?? "", "number");
    const agent = resolveCustomerAgent(customer);
    const history = Array.isArray(customer.activityHistory) ? [...customer.activityHistory].reverse() : [];
    const documents = Array.isArray(customer.documents) ? customer.documents : [];
    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Customer Sheet - ${value(customer.name || "Application")}</title>
                                        <style>

                * { box-sizing: border-box; }
                body { margin: 0; padding: 32px 18px; color: #172033; background: #f3f6fb; font: 14px/1.5 Arial, sans-serif; }
                main { max-width: 1000px; margin: auto; }
                header, section { margin-bottom: 18px; padding: 22px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
                header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
                h1 { margin: 0 0 4px; font-size: 24px; }
                h2 { margin: 0 0 16px; font-size: 17px; }
                p { margin: 0; color: #64748b; }
                .meta { text-align: right; color: #64748b; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
                .field span { display: block; margin-bottom: 4px; color: #64748b; font-size: 12px; }
                .field strong { display: block; overflow-wrap: anywhere; font-weight: 600; white-space: pre-wrap; }
                .history-item, .document-item { padding: 12px 0; border-top: 1px solid #edf1f6; }
                .history-item:first-child, .document-item:first-child { padding-top: 0; border-top: 0; }
                .history-item small, .document-item small { display: block; margin-top: 4px; color: #64748b; }
                input, button { font: inherit; }
                .field input, .field select { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; color: #172033; background: #fff; }
                .sheet-documents-empty { margin: 0; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 9px; color: #64748b; background: #f8fafc; text-align: center; }
                .sheet-upload { display: block; margin-top: 18px; padding: 18px; border: 1px solid #dbeafe; border-radius: 10px; color: #1e3a8a; background: #eff6ff; font-weight: 600; }
                .sheet-upload::before { content: "＋"; display: inline-grid; place-items: center; width: 28px; height: 28px; margin-right: 9px; border-radius: 50%; color: #fff; background: #2563eb; font-size: 20px; vertical-align: middle; }
                .sheet-upload input { display: block; width: 100%; margin-top: 12px; padding: 12px; border: 1px dashed #93c5fd; border-radius: 8px; color: #334155; background: #fff; cursor: pointer; }
                .sheet-upload input::file-selector-button { margin-right: 12px; padding: 8px 13px; border: 0; border-radius: 6px; color: #fff; background: #2563eb; font: inherit; font-weight: 600; cursor: pointer; }
                .sheet-upload input::file-selector-button:hover { background: #1d4ed8; }
                .sheet-actions { position: sticky; top: 10px; z-index: 1; display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-bottom: 12px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fffffff2; }
                .sheet-actions p { margin-right: auto; }
                button { padding: 9px 14px; border: 0; border-radius: 7px; color: #fff; background: #2563eb; cursor: pointer; }
                button:disabled { opacity: .6; cursor: wait; }
                @media print { body { padding: 0; background: #fff; } header, section { break-inside: avoid; box-shadow: none; } .sheet-actions { display: none; } }
            </style>
        </head>
        <body>
            <main>
                <form id="customerSheetForm">
                    <div class="sheet-actions">
                        <p id="sheetSaveStatus">Edit the fields below, then save your changes.</p>
                        <button id="sheetSaveButton" type="submit">Save changes</button>
                    </div>
                <header>
                    <div>
                        <label class="field"><span>Customer name</span><input data-customer-field="name" value="${escapeHTML(customer.name || "")}" required></label>
                        <p>Customer application sheet</p>
                    </div>
                    <div class="meta">Application #${value(customer.id)}<br>${value(formatActivityDate(customer.createdAt))}</div>
                </header>
                <section>
                    <h2>Personal Information</h2>
                    <div class="grid">
                        ${field("Age", customer.age)}
                        ${field("Mobile Number", customer.phone)}
                        ${field("Personal Email-ID", customer.personalEmail)}
                        ${field("CIBIL Score", customer.cibil)}
                        ${field("Location / State Code", customer.location)}
                        ${field("Present Address", customer.address)}
                        ${field("Permanent Address", customer.permanentAddress)}
                        ${field("Mother Name", customer.motherName)}
                        ${field("Spouse Name", customer.spouseName)}
                    </div>
                </section>
                <section>
                    <h2>Office Information</h2>
                    <div class="grid">
                        ${field("Company Name", customer.companyName)}
                        ${field("Office Email-ID", customer.officeEmail)}
                        ${field("Office Address", customer.officeAddress)}
                        ${moneyField("Salary", customer.salary)}
                        ${field("Company Listed Bank", customer.companyBank)}
                    </div>
                </section>
                <section>
                    <h2>Loan Information</h2>
                    <div class="grid">
                        ${moneyField("Loan Amount", customer.loanAmount)}
                        ${moneyField("BT Amount", customer.btAmount)}
                        ${field("BT Bank", customer.btBank)}
                        ${moneyField("In-Hand Loan Amount", customer.inHandAmount)}
                        ${field("Bank(s) Already Applied", customer.banksApplied)}
                        ${field("Bank Being Pushed", bankNameForCustomer(customer))}
                    </div>
                </section>
                <section>
                    <h2>Financial Obligations</h2>
                    <div class="grid">
                        ${field("Number of Enquiries", customer.enquiries)}
                        ${field("Credit Cards Used", customer.creditCards)}
                        ${field("Delay Payments", customer.delays)}
                        ${OUTSTANDING_LOAN_FIELDS.map(item => moneyField(item.label, customer[item.key]) +
                            ((customer[`${item.key}Banks`] || []).length
                                ? field(`${item.name} Bank(s)`, customer[`${item.key}Banks`].join(", "))
                                : "")
                        ).join("")}
                        ${EMI_LOAN_FIELDS.map(item => moneyField(item.label, customer[item.key])).join("")}
                        ${moneyField("Other EMI", customer.otherEmi)}
                    </div>
                </section>
                <section>
                    <h2>Application &amp; Bank Updates</h2>
                    <div class="grid">
                        ${field("Application Status", normalizeCustomerStatus(customer.status))}
                        ${field("Assigned Agent", agent?.name || customer.agentId)}
                        ${field("Bank Status", customer.bankStatus ? normalizeBankProcessingStatus(customer.bankStatus) : "")}
                        ${field("Bank Application Number", customer.bankApplicationNumber)}
                        ${field("Bank Remark", customer.bankRemarks)}
                        ${field("Latest Update", formatActivityDate(customer.bankStatusUpdatedAt))}
                        ${field("Call Remark", customer.remarks)}
                        ${field("Callback Reminder", formatActivityDate(customer.callbackAt))}
                    </div>
                </section>
                <section>
                    <h2>Customer Documents</h2>
                    ${documents.length
                        ? documents.map(document => `
                            <div class="document-item">
                                <strong>${value(document.name)}</strong>
                                <small>Uploaded ${value(formatActivityDate(document.uploadedAt))} by ${value(document.uploadedBy || "Unknown")}</small>
                            </div>
                        `).join("")
                        : '<p class="sheet-documents-empty">No documents uploaded yet. Add files below to keep the application documents together.</p>'}
                    <label class="sheet-upload">Upload documents
                        <input id="sheetDocumentsInput" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv">
                    </label>
                </section>
                <section>
                    <h2>Activity History</h2>
                    ${history.length
                        ? history.map(entry => `
                            <div class="history-item">
                                <strong>${value(entry.message || "Activity recorded")}</strong>
                                <small>By ${value(entry.by || "System")} · ${value(formatActivityDate(entry.at))}</small>
                            </div>
                        `).join("")
                        : "<p>No activity recorded yet.</p>"}
                </section>
                </form>
            </main>
            <script>
                document.getElementById("customerSheetForm").addEventListener("submit", async event => {
                    event.preventDefault();
                    const button = document.getElementById("sheetSaveButton");
                    const status = document.getElementById("sheetSaveStatus");
                    if (!window.opener || window.opener.closed || typeof window.opener.updateCustomerFromSheet !== "function") {
                        status.textContent = "The portal tab is unavailable. Reopen this sheet from the portal and try again.";
                        return;
                    }
                    button.disabled = true;
                    status.textContent = "Saving changes…";
                    try {
                        const updates = Object.fromEntries(
                            [...document.querySelectorAll("[data-customer-field]")]
                                .map(input => [input.dataset.customerField, input.value])
                        );
                        const files = [...document.getElementById("sheetDocumentsInput").files];
                        const result = await window.opener.updateCustomerFromSheet(${Number(customer.id)}, updates, files);
                        status.textContent = "Changes saved. " +
                            (result.uploaded ? result.uploaded + " document(s) uploaded. " : "") +
                            (result.skipped ? result.skipped + " unsupported file(s) skipped." : "");
                        document.getElementById("sheetDocumentsInput").value = "";
                    } catch (error) {
                        status.textContent = "Could not save: " + error.message;
                    } finally {
                        button.disabled = false;
                    }
                });
            </script>
        </body>
        </html>`;

    const sheetUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    event.currentTarget.href = sheetUrl;
    setTimeout(() => URL.revokeObjectURL(sheetUrl), 60000);
    return true;
}

function openCustomerSheet(event, id) {
    event?.preventDefault();
    openCustomer(Number(id));
    return false;
}

async function updateCustomerFromSheet(customerId, updates, files = []) {
    if (!currentUser) throw new Error("Please log in to the portal again.");
    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(customerId));
    if (!customer) throw new Error("This application is no longer available to your account.");
    const previousBankStatus = customer.bankStatus || "";

    const editableKeys = new Set([
        "name", "age", "phone", "personalEmail", "cibil", "location", "address",
        "permanentAddress", "motherName", "spouseName", "companyName", "officeEmail",
        "officeAddress", "salary", "companyBank", "loanAmount", "btAmount", "btBank",
        "inHandAmount", "banksApplied", "banksPushing", "enquiries", "creditCards",
        "delays", ...OUTSTANDING_LOAN_KEYS, ...EMI_LOAN_KEYS, "otherEmi", "status",
        "bankStatus", "bankApplicationNumber", "bankRemarks", "remarks", "callbackAt"
    ]);
    const numericKeys = new Set([
        "age", "cibil", "salary", "loanAmount", "btAmount", "inHandAmount",
        "enquiries", ...OUTSTANDING_LOAN_KEYS, ...EMI_LOAN_KEYS, "otherEmi"
    ]);
    const changedFields = [];
    if (Object.prototype.hasOwnProperty.call(updates || {}, "name") && !String(updates.name || "").trim()) {
        throw new Error("Customer name cannot be empty.");
    }
    Object.entries(updates || {}).forEach(([key, rawValue]) => {
        if (!editableKeys.has(key)) return;
        const nextValue = numericKeys.has(key)
            ? (rawValue === "" ? 0 : Number(rawValue))
            : String(rawValue ?? "").trim();
        if (numericKeys.has(key) && !Number.isFinite(nextValue)) {
            throw new Error(`Enter a valid number for ${key}.`);
        }
        if (customer[key] !== nextValue) {
            customer[key] = nextValue;
            changedFields.push(key);
        }
    });

    if (customer.bankStatus && customer.approvalStatus === "approved") {
        customer.bankStatus = normalizeBankProcessingStatus(customer.bankStatus);
        customer.status = customer.bankStatus;
    } else if (Object.prototype.hasOwnProperty.call(updates || {}, "status")) {
        customer.status = normalizeCustomerStatus(customer.status);
    }
    if (customer.bankStatus && customer.bankStatus !== previousBankStatus) {
        customer.bankStatusUpdatedAt = new Date().toISOString();
        customer.bankStatusUpdatedBy = currentUser.id;
    }

    const uploaded = [];
    let skipped = 0;
    for (const file of files) {
        if (!isSupportedCustomerDocument(file)) {
            skipped++;
            continue;
        }
        const documentId = window.crypto?.randomUUID
            ? crypto.randomUUID()
            : `${customer.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const metadata = {
            id: documentId,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: `${currentUser.name} (${currentUser.id})`
        };
        await storeCustomerDocument(documentId, file, customer.id, metadata);
        if (!Array.isArray(customer.documents)) customer.documents = [];
        customer.documents.push(metadata);
        uploaded.push(metadata);
    }

    if (changedFields.length) {
        recordCustomerActivity(customer, "updated", `Application details updated from customer sheet (${changedFields.join(", ")})`);
    }
    if (uploaded.length) {
        recordCustomerActivity(customer, "document", `Uploaded ${uploaded.length} document(s): ${uploaded.map(item => item.name).join(", ")}`);
    }
    if (changedFields.length || uploaded.length) {
        await saveData();
        renderCustomers();
        updateDashboard();
        renderTLBankApplications();
        renderBankApplications();
        renderPerformanceLoanAmounts();
    }

    return { uploaded: uploaded.length, skipped };
}

function renderCustomerBankSummary(customer) {
    const summary = document.getElementById("customerBankSummary");
    if (!summary) return;

    const hasBankUpdate = Boolean(
        customer.approvalStatus === "approved" ||
        customer.bankRemarks ||
        customer.bankApplicationNumber ||
        customer.bankStatusUpdatedAt
    );
    summary.classList.toggle("hidden", !hasBankUpdate);
    if (!hasBankUpdate) return;

    document.getElementById("customerBankSummaryName").textContent =
        bankNameForCustomer(customer) || "Not selected";
    document.getElementById("customerBankSummaryApplication").textContent =
        customer.bankApplicationNumber || "Not assigned";
    document.getElementById("customerBankSummaryStatus").textContent =
        customer.bankStatus ? normalizeBankProcessingStatus(customer.bankStatus) : "Awaiting bank update";

    const updatedBy = users.find(user => user.id === customer.bankStatusUpdatedBy);
    const updatedAt = customer.bankStatusUpdatedAt
        ? formatActivityDate(customer.bankStatusUpdatedAt)
        : "";
    document.getElementById("customerBankSummaryMeta").textContent =
        updatedAt
            ? `Updated by ${updatedBy?.name || customer.bankStatusUpdatedBy || "Bank backend"} · ${updatedAt}`
            : "Latest update from the bank backend";

    const remark = document.getElementById("customerBankSummaryRemark");
    remark.textContent = customer.bankRemarks || "The bank backend has not added a remark yet.";
    remark.classList.toggle("is-empty", !customer.bankRemarks);
    remark.classList.remove("hidden");
}

function setCustomerModalReadOnly(isReadOnly) {
    const form = document.getElementById("customerForm");
    if (!form) return;

    form.querySelectorAll("input, select, textarea").forEach(control => {
        // Document checkboxes stay usable so bank users can download selected files.
        const keepEnabled = control.matches(".customer-document-checkbox, #selectAllCustomerDocuments");
        control.disabled = isReadOnly && !keepEnabled;
    });
    form.querySelector("#customerDocumentDropZone")?.classList.toggle("hidden", isReadOnly);
    form.querySelector("#deleteSelectedDocumentsButton")?.classList.toggle("hidden", isReadOnly);
    if (isReadOnly) document.getElementById("forwardCustomerToTLButton")?.classList.add("hidden");
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.classList.toggle("hidden", isReadOnly);
    form.querySelectorAll(".customer-document-actions .delete-document-btn")
        .forEach(button => button.classList.toggle("hidden", isReadOnly));
}


/* ================= CUSTOMER ACTIVITY HISTORY ================= */

function recordCustomerActivity(customer, type, message) {
    if (!customer) return;

    if (!Array.isArray(customer.activityHistory)) {
        customer.activityHistory = [];
    }

    customer.activityHistory.push({
        type,
        message,
        by: currentUser ? `${currentUser.name} (${currentUser.id})` : "System",
        at: new Date().toISOString()
    });
}

function renderCustomerHistory(customer) {
    const container = document.getElementById("customerHistory");
    if (!container) return;

    const history = Array.isArray(customer.activityHistory)
        ? [...customer.activityHistory].reverse()
        : [];

    container.innerHTML = history.length
        ? history.map(entry => `
            <div class="history-entry">
                <strong>${escapeHTML(entry.message || "Activity recorded")}</strong>
                <small>By ${escapeHTML(entry.by || "System")} · ${escapeHTML(formatActivityDate(entry.at))}</small>
            </div>
        `).join("")
        : '<p class="history-empty">No activity recorded yet.</p>';
}

const CUSTOMER_DOCUMENT_ALLOWED_EXTENSION = /\.(pdf|png|jpe?g|webp|docx?|xlsx?|csv)$/i;

function isSupportedCustomerDocument(file) {
    return CUSTOMER_DOCUMENT_ALLOWED_EXTENSION.test(file.name);
}

async function storeCustomerDocument(documentId, file, customerId, metadata) {
    customerDocumentFiles.set(documentId, file);
}

async function getStoredCustomerDocument(documentId) {
    return customerDocumentFiles.get(documentId) || null;
}

async function deleteStoredCustomerDocument(documentId, customerId) {
    customerDocumentFiles.delete(documentId);
}

function renderCustomerDocuments(customer) {
    const container = document.getElementById("customerDocumentList");
    if (!container) return;

    const documents = Array.isArray(customer.documents) ? customer.documents : [];
    const documentIds = new Set(documents.map(document => document.id));
    selectedCustomerDocumentIds.forEach(id => {
        if (!documentIds.has(id)) selectedCustomerDocumentIds.delete(id);
    });

    container.innerHTML = documents.length
        ? documents.map(document => `
            <div class="customer-document-item">
                <label class="customer-document-select">
                    <input type="checkbox" class="customer-document-checkbox" value="${escapeHTML(document.id)}" ${selectedCustomerDocumentIds.has(document.id) ? "checked" : ""} onchange="toggleCustomerDocumentSelection('${escapeHTML(document.id)}', this.checked)" aria-label="Select ${escapeHTML(document.name)}">
                </label>
                <span class="customer-document-name">
                    <strong>${escapeHTML(document.name)}</strong>
                    <small class="customer-phone">Uploaded ${escapeHTML(formatActivityDate(document.uploadedAt))} by ${escapeHTML(document.uploadedBy || "Unknown")}</small>
                </span>
                <div class="customer-document-actions">
                    <button type="button" class="action-btn" onclick="downloadCustomerDocument(${Number(customer.id)}, '${escapeHTML(document.id)}')">Download</button>
                    <button type="button" class="delete-document-btn" onclick="deleteCustomerDocument(${Number(customer.id)}, '${escapeHTML(document.id)}')" aria-label="Delete ${escapeHTML(document.name)}">Delete</button>
                </div>
            </div>
        `).join("")
        : '<p class="history-empty">No documents uploaded.</p>';

    updateCustomerDocumentSelectionControls(documents);
}

function toggleCustomerDocumentSelection(documentId, isSelected) {
    if (isSelected) selectedCustomerDocumentIds.add(documentId);
    else selectedCustomerDocumentIds.delete(documentId);
    const customerId = Number(document.getElementById("customerId").value);
    const customer = customers.find(item => item.id === customerId);
    if (customer) updateCustomerDocumentSelectionControls(customer.documents || []);
}

function toggleAllCustomerDocuments(isSelected) {
    const customerId = Number(document.getElementById("customerId").value);
    const customer = customers.find(item => item.id === customerId);
    if (!customer) return;
    (customer.documents || []).forEach(document => {
        if (isSelected) selectedCustomerDocumentIds.add(document.id);
        else selectedCustomerDocumentIds.delete(document.id);
    });
    renderCustomerDocuments(customer);
}

function updateCustomerDocumentSelectionControls(documents) {
    const selectedCount = documents.filter(document => selectedCustomerDocumentIds.has(document.id)).length;
    const selectAll = document.getElementById("selectAllCustomerDocuments");
    const count = document.getElementById("selectedDocumentCount");
    const downloadButton = document.getElementById("downloadSelectedDocumentsButton");
    const deleteButton = document.getElementById("deleteSelectedDocumentsButton");

    if (selectAll) {
        selectAll.checked = documents.length > 0 && selectedCount === documents.length;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < documents.length;
        selectAll.disabled = documents.length === 0;
    }
    if (count) count.textContent = `${selectedCount} selected`;
    if (downloadButton) downloadButton.disabled = selectedCount === 0;
    if (deleteButton) deleteButton.disabled = selectedCount === 0;
}

function getSelectedCustomerDocuments() {
    const customerId = Number(document.getElementById("customerId").value);
    const customer = getVisibleCustomers().find(item => Number(item.id) === customerId);
    if (!customer) return { customer: null, documents: [] };
    const documents = (customer.documents || []).filter(item => selectedCustomerDocumentIds.has(item.id));
    return { customer, documents };
}

async function downloadSelectedCustomerDocuments() {
    const { customer, documents } = getSelectedCustomerDocuments();
    if (!customer || !documents.length) return;

    let failed = [];
    for (const item of documents) {
        try {
            const file = await getStoredCustomerDocument(item.id);
            if (!file) throw new Error("File unavailable");
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = item.name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
            failed.push(`${item.name} (${error.message})`);
        }
    }
    if (failed.length) alert(`Could not download: ${failed.join(", ")}.`);
}

async function deleteSelectedCustomerDocuments() {
    if (currentUser?.role === "bank_backend") {
        alert("Bank backend users cannot delete customer documents.");
        return;
    }
    const { customer, documents } = getSelectedCustomerDocuments();
    if (!customer || !documents.length) return;
    if (!confirm(`Delete ${documents.length} selected document(s)? This cannot be undone.`)) return;

    await removeCustomerDocuments(customer, documents);
}

async function removeCustomerDocuments(customer, documents) {
    const originalDocuments = [...(customer.documents || [])];
    const originalHistory = Array.isArray(customer.activityHistory) ? [...customer.activityHistory] : [];
    const originallySelectedIds = new Set(
        documents
            .filter(item => selectedCustomerDocumentIds.has(item.id))
            .map(item => item.id)
    );
    const deleted = [];
    const failed = [];

    for (const item of documents) {
        try {
            const file = await getStoredCustomerDocument(item.id);
            await deleteStoredCustomerDocument(item.id, customer.id);
            customer.documents = customer.documents.filter(document => document.id !== item.id);
            selectedCustomerDocumentIds.delete(item.id);
            deleted.push({ item, file });
        } catch (error) {
            failed.push(`${item.name} (${error.message})`);
        }
    }

    if (deleted.length) {
        try {
            recordCustomerActivity(
                customer,
                "document",
                `Deleted ${deleted.length} document(s): ${deleted.map(entry => entry.item.name).join(", ")}`
            );
            await saveData();
        } catch (error) {
            customer.documents = originalDocuments;
            customer.activityHistory = originalHistory;
            const restoreFailures = [];
            for (const { item, file } of deleted) {
                if (originallySelectedIds.has(item.id)) selectedCustomerDocumentIds.add(item.id);
                else selectedCustomerDocumentIds.delete(item.id);
                if (!file) continue;
                try {
                    await storeCustomerDocument(item.id, file, customer.id, item);
                } catch (restoreError) {
                    restoreFailures.push(`${item.name} (${restoreError.message})`);
                }
            }
            failed.push(`Could not save customer record: ${error.message}`);
            if (restoreFailures.length) {
                failed.push(`Could not restore deleted files: ${restoreFailures.join(", ")}`);
            }
            await saveData().catch(saveError => {
                console.error("Could not restore customer metadata:", saveError);
                failed.push(`Could not restore customer metadata: ${saveError.message}`);
            });
        }

        renderCustomerDocuments(customer);
        renderCustomerHistory(customer);
    }
    if (failed.length) alert(`Some documents could not be deleted:\n${failed.join("\n")}`);
}

function setupCustomerDocumentDropzone() {
    const dropZone = document.getElementById("customerDocumentDropZone");
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, event => {
            event.preventDefault();
            event.stopPropagation();
            dropZone.classList.add("drag-over");
        });
    });

    ["dragleave", "dragend"].forEach(eventName => {
        dropZone.addEventListener(eventName, event => {
            if (eventName === "dragleave" && dropZone.contains(event.relatedTarget)) return;
            dropZone.classList.remove("drag-over");
        });
    });

    dropZone.addEventListener("drop", event => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove("drag-over");
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        const files = droppedFiles.filter(isSupportedCustomerDocument);
        if (files.length < droppedFiles.length) {
            alert("Some files were skipped. Upload PDF, image, Word, Excel, or CSV files only.");
        }
        if (files.length) uploadCustomerDocuments(null, files);
    });
}

async function uploadCustomerDocuments(event, droppedFiles = null) {
    const input = event?.target || document.getElementById("customerDocumentsInput");
    if (!currentUser) {
        alert("Please log in before uploading documents.");
        if (input) input.value = "";
        return;
    }

    if (currentUser.role === "bank_backend") {
        alert("Bank backend users cannot upload customer documents.");
        if (input) input.value = "";
        return;
    }

    const files = Array.from(droppedFiles || input?.files || []);
    const customerId = Number(document.getElementById("customerId").value);

    if (!files.length) return;
    const supportedFiles = files.filter(isSupportedCustomerDocument);
    const rejectedFiles = files
        .filter(file => !isSupportedCustomerDocument(file))
        .map(file => `${file.name} (unsupported file type)`);
    if (!supportedFiles.length) {
        alert(`No supported documents were selected. Upload PDF, image, Word, Excel, or CSV files only.${rejectedFiles.length ? `\nSkipped: ${rejectedFiles.join(", ")}` : ""}`);
        if (input) input.value = "";
        return;
    }

    const visibleCustomer = getVisibleCustomers().find(item => Number(item.id) === customerId);
    if (!visibleCustomer) {
        alert("Save the customer record first, then upload documents.");
        if (input) input.value = "";
        return;
    }

    const customer = customers.find(item => Number(item.id) === customerId);
    if (!customer) {
        alert("Customer record could not be found. Please reopen it and try again.");
        if (input) input.value = "";
        return;
    }

    const uploaded = [];
    const failed = [...rejectedFiles];
    const originalDocuments = Array.isArray(customer.documents) ? [...customer.documents] : [];
    const originalHistory = Array.isArray(customer.activityHistory) ? [...customer.activityHistory] : [];
    try {
        if (!Array.isArray(customer.documents)) customer.documents = [];
        for (const file of supportedFiles) {
            const documentId = window.crypto?.randomUUID
                ? crypto.randomUUID()
                : `${customerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            try {
                const metadata = {
                    id: documentId,
                    name: file.name,
                    type: file.type || "application/octet-stream",
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: currentUser ? `${currentUser.name} (${currentUser.id})` : "System"
                };
                await storeCustomerDocument(documentId, file, customer.id, metadata);
                customer.documents.push(metadata);
                uploaded.push(metadata);
            } catch (error) {
                failed.push(`${file.name} (${error.message})`);
            }
        }
    } catch (error) {
        alert(`Could not upload documents: ${error.message}`);
        if (input) input.value = "";
        return;
    }

    if (uploaded.length) {
        try {
            recordCustomerActivity(
                customer,
                "document",
                `Uploaded ${uploaded.length} document(s): ${uploaded.map(document => document.name).join(", ")}`
            );
            await saveData();
        } catch (error) {
            customer.documents = originalDocuments;
            customer.activityHistory = originalHistory;
            const cleanupFailures = [];
            for (const document of uploaded) {
                try {
                    await deleteStoredCustomerDocument(document.id, customer.id);
                } catch (cleanupError) {
                    cleanupFailures.push(`${document.name} (${cleanupError.message})`);
                }
            }
            failed.push(...uploaded.map(document => `${document.name} (could not save customer record: ${error.message})`));
            if (cleanupFailures.length) {
                failed.push(`Storage cleanup failed: ${cleanupFailures.join(", ")}`);
            }
            await saveData().catch(saveError => {
                console.error("Could not restore customer metadata:", saveError);
                failed.push(`Could not restore customer metadata: ${saveError.message}`);
            });
        }
        if (customer.documents.some(document => uploaded.some(item => item.id === document.id))) {
            renderCustomerDocuments(customer);
            renderCustomerHistory(customer);
        }
    }

    if (failed.length) {
        alert(`Some documents could not be saved:\n${failed.join("\n")}`);
    }
    if (input) input.value = "";
}

async function downloadCustomerDocument(customerId, documentId) {
    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(customerId));
    if (!customer) {
        alert("You don't have permission to access this document.");
        return;
    }

    const metadata = (customer.documents || []).find(document => document.id === documentId);
    if (!metadata) return;

    try {
        const file = await getStoredCustomerDocument(documentId);
        if (!file) throw new Error("This document is no longer available in browser storage.");
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = metadata.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        alert(error.message);
    }
}

async function deleteCustomerDocument(customerId, documentId) {
    if (currentUser?.role === "bank_backend") {
        alert("Bank backend users cannot delete customer documents.");
        return;
    }
    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(customerId));
    if (!customer) {
        alert("You don't have permission to delete this document.");
        return;
    }

    const metadata = (customer.documents || []).find(document => document.id === documentId);
    if (!metadata || !confirm(`Delete the document "${metadata.name}"? This cannot be undone.`)) return;

    await removeCustomerDocuments(customer, [metadata]);
}

function formatActivityDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString("en-IN");
}

function toDateTimeLocalValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function requestCallbackNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        // Permission is requested after login because browsers require user interaction.
        return;
    }
    updateCallbackNotificationStatus();
}

function enableCallbackNotifications() {
    if (!("Notification" in window)) {
        updateCallbackNotificationStatus("This browser does not support notifications.");
        return;
    }

    Notification.requestPermission().then(permission => {
        updateCallbackNotificationStatus(
            permission === "granted"
                ? "Notifications are enabled."
                : "Notifications are blocked. Allow them in browser settings."
        );
        if (permission === "granted") startCallbackReminderWatcher();
    });
}

function updateCallbackNotificationStatus(message) {
    const status = document.getElementById("callbackNotificationStatus");
    if (!status) return;
    status.textContent = message || (
        "Notification" in window && Notification.permission === "granted"
            ? "Notifications are enabled."
            : "Notifications are not enabled."
    );
}

function startCallbackReminderWatcher() {
    if (callbackNotificationTimer) clearInterval(callbackNotificationTimer);
    checkCallbackReminders();
    callbackNotificationTimer = setInterval(checkCallbackReminders, 30000);
}

function checkCallbackReminders() {
    if (!currentUser || currentUser.role === "higher_management" || !("Notification" in window) || Notification.permission !== "granted") return;

    const now = Date.now();
    getVisibleCustomers().forEach(customer => {
        const callbackTime = new Date(customer.callbackAt || "").getTime();
        if (!Number.isFinite(callbackTime) || callbackTime > now || notifiedCallbackIds.has(customer.id)) return;

        new Notification("Customer callback due", {
            body: `Call ${customer.name}${customer.phone ? ` (${customer.phone})` : ""} now.`,
            tag: `callback-${customer.id}`
        });
        notifiedCallbackIds.add(customer.id);
    });
}


/* ================= FILL FORM ================= */

function getCustomerFormInput(labelText) {
    const normalize = value => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const expectedLabel = normalize(labelText);
    const group = [...document.querySelectorAll("#customerForm .form-group")].find(item =>
        normalize(item.querySelector("label")?.textContent) === expectedLabel
    );
    return group?.querySelector("input, textarea, select") || null;
}

function setCustomerFormValue(labelText, value) {
    const input = getCustomerFormInput(labelText);
    if (!input) return;
    if (normalizeImportHeader(labelText).includes("email")) input.type = "email";
    input.value = value ?? "";
}

function getCustomerSalaryInput() {
    return getCustomerFormInput("Salary");
}

function fillCustomerForm(c) {

    document.getElementById("customerName").value =
        c.name || "";

    document.getElementById("customerAge").value =
        c.age || "";

    document.getElementById("customerPhone").value =
        c.phone || "";

    setCustomerFormValue("Personal Email-ID", c.personalEmail || "");

    setCustomerFormValue("CIBIL Score", c.cibil || 0);

    document.getElementById("customerLocation").value =
        c.location || "";

    document.getElementById("customerAddress").value =
        c.address || "";

    document.getElementById("permanentAddress").value =
        c.permanentAddress || "";

    document.getElementById("motherName").value =
        c.motherName || "";

    document.getElementById("spouseName").value =
        c.spouseName || "";

    document.getElementById("loanAmount").value =
        c.loanAmount || 0;

    document.getElementById("btAmount").value =
        c.btAmount || 0;

    document.getElementById("btBank").value =
        c.btBank || "";

    document.getElementById("inHandAmount").value =
        c.inHandAmount || 0;

    const salaryInput = getCustomerSalaryInput();
    if (salaryInput) salaryInput.value = c.salary || 0;

    setCustomerFormValue("Company Name", c.companyName || "");
    setCustomerFormValue("Office Address", c.officeAddress || "");
    setCustomerFormValue("Office Email-ID", c.officeEmail || "");

    document.getElementById("companyBank").value =
        c.companyBank || "";

    document.getElementById("enquiries").value =
        c.enquiries || 0;

    document.getElementById("creditCards").value =
        c.creditCards || "";

    document.getElementById("delays").value =
        c.delays || "";

    OUTSTANDING_LOAN_FIELDS.forEach(item => {
        document.getElementById(item.key).value = c[item.key] || 0;
        setLoanBankSelection(item.key, c[`${item.key}Banks`]);
    });

    EMI_LOAN_FIELDS.forEach(item => {
        document.getElementById(item.key).value = c[item.key] || 0;
    });


    document.getElementById("otherEmi").value =
        c.otherEmi || 0;

    document.getElementById("banksApplied").value =
        c.banksApplied || "";

    document.getElementById("banksPushing").value =
        c.banksPushing || "";

    document.getElementById("customerStatus").value =
        normalizeCustomerStatus(c.status || "Pending");

    document.getElementById("remarks").value =
        c.remarks || "";

    document.getElementById("callbackAt").value =
        toDateTimeLocalValue(c.callbackAt);

}


/* ================= SAVE CUSTOMER ================= */

document
    .getElementById("customerForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();
            const shouldForwardToTL = event.submitter?.id === "forwardCustomerToTLButton";


            const id =
                Number(
                    document
                        .getElementById("customerId")
                        .value
                );


            const isNew = !id;
            let customer = customers.find(
                c => c.id === id
            );
            const previousRemarks = customer ? String(customer.remarks || "") : "";
            const previousCallbackAt = customer ? String(customer.callbackAt || "") : "";

            if (isNew) {
                // Agents own what they create. A TL keeps it on their own list until they
                // assign it (assigning to "the first agent found" could leave it unassigned and invisible).
                const assignedAgent = currentUser.id;

                customer = {
                    id: Math.max(0, ...customers.map(c => Number(c.id) || 0)) + 1,
                    agentId: assignedAgent
                };
            } else if (!customer) {
                return;
            }


            /* Permission */

            if (
                currentUser.role === "agent" &&
                resolveCustomerAgentId(customer.agentId) !== currentUser.id
            ) {

                alert(
                    "You cannot edit this customer."
                );

                return;

            }

            const targetTL = currentUser.role === "agent"
                ? users.find(user =>
                    user.role === "tl" && teamsMatch(user.team, currentUser.team)
                )
                : null;
            if (shouldForwardToTL && currentUser.role !== "agent") {
                alert("Only agents can forward customer applications to a team leader.");
                return;
            }
            if (shouldForwardToTL && normalizeCustomerStatus(document.getElementById("customerStatus").value) !== "Lead") {
                alert("Set the application status to Lead before forwarding it to your team leader.");
                return;
            }
            if (shouldForwardToTL && customer.approvalStatus === "approved") {
                alert("This application has already been approved by your team leader and sent to the bank.");
                return;
            }
            if (currentUser.role === "bank_backend") {
                alert("Bank backend users update applications from the Bank Applications page.");
                return;
            }
            if (shouldForwardToTL && !targetTL) {
                alert(`No team leader is configured for ${currentUser.team || "your team"}. Ask your administrator to assign a TL to your team.`);
                return;
            }


            customer.name =
                document
                    .getElementById("customerName")
                    .value;


            customer.age =
                Number(
                    document
                        .getElementById("customerAge")
                        .value
                );


            customer.phone =
                document
                    .getElementById("customerPhone")
                    .value;


            customer.address =
                document
                    .getElementById("customerAddress")
                    .value;

            customer.permanentAddress =
                document
                    .getElementById("permanentAddress")
                    .value;

            customer.motherName =
                document
                    .getElementById("motherName")
                    .value;

            customer.spouseName =
                document
                    .getElementById("spouseName")
                    .value;

            customer.location =
                document
                    .getElementById("customerLocation")
                    .value
                    .trim()
                    .toUpperCase();


            customer.loanAmount =
                Number(
                    document
                        .getElementById("loanAmount")
                        .value
                );


            customer.btAmount =
                Number(
                    document
                        .getElementById("btAmount")
                        .value
                );


            customer.btBank =
                document
                    .getElementById("btBank")
                    .value;


            customer.inHandAmount =
                Number(
                    document
                        .getElementById("inHandAmount")
                        .value
                );


            const salaryInput = getCustomerSalaryInput();
            customer.salary = Number(salaryInput?.value || 0);


            customer.companyName = getCustomerFormInput("Company Name")?.value || "";
            customer.officeAddress = getCustomerFormInput("Office Address")?.value || "";
            customer.personalEmail = getCustomerFormInput("Personal Email-ID")?.value || "";
            customer.officeEmail = getCustomerFormInput("Office Email-ID")?.value || "";


            customer.companyBank =
                document
                    .getElementById("companyBank")
                    .value;


            customer.cibil =
                Number(getCustomerFormInput("CIBIL Score")?.value || 0);


            customer.enquiries =
                Number(
                    document
                        .getElementById("enquiries")
                        .value
                );


            customer.creditCards =
                document
                    .getElementById("creditCards")
                    .value;


            customer.delays =
                document
                    .getElementById("delays")
                    .value;


            OUTSTANDING_LOAN_FIELDS.forEach(item => {
                customer[item.key] = Number(document.getElementById(item.key).value) || 0;
                customer[`${item.key}Banks`] = [...(loanBankSelections[item.key] || [])];
            });


            EMI_LOAN_FIELDS.forEach(item => {
                customer[item.key] = Number(document.getElementById(item.key).value) || 0;
            });


            customer.otherEmi =
                Number(
                    document
                        .getElementById("otherEmi")
                        .value
                );


            customer.banksApplied =
                document
                    .getElementById("banksApplied")
                    .value;

            customer.banksPushing =
                document
                    .getElementById("banksPushing")
                    .value;

            customer.status = normalizeCustomerStatus(
                document
                    .getElementById("customerStatus")
                    .value
            );
            if (customer.approvalStatus === "approved" && customer.bankStatus) {
                customer.status = normalizeBankProcessingStatus(customer.bankStatus);
            }


            customer.remarks =
                document
                    .getElementById("remarks")
                    .value;

            customer.callbackAt =
                document
                    .getElementById("callbackAt")
                    .value;

            if (currentUser.role === "agent") {
                if (shouldForwardToTL) {
                    customer.forwardedToTL = targetTL.id;
                    customer.forwardedAt = new Date().toISOString();
                    customer.approvalStatus = "pending";
                    delete customer.tlReturnComment;
                    delete customer.tlReturnAt;
                    delete customer.tlReturnBy;
                    delete customer.reviewedAt;
                    delete customer.reviewedBy;
                } else if (!["approved", "pending"].includes(customer.approvalStatus)) {
                    // Saving edits must not pull an application back out of the TL queue
                    // or the bank queue once it has been forwarded/approved.
                    customer.approvalStatus = "draft";
                    delete customer.forwardedToTL;
                    delete customer.forwardedAt;
                }
            }

            if (isNew) {
                customer.activityHistory = [];
                customers.push(customer);
                recordCustomerActivity(customer, "created", "Customer application created");
                if (customer.agentId) {
                    const assignedAgent = users.find(user => user.id === customer.agentId);
                    recordCustomerActivity(customer, "assignment", `Assigned to ${assignedAgent ? assignedAgent.name : customer.agentId}`);
                }
            } else if (customer.remarks !== previousRemarks) {
                recordCustomerActivity(customer, "remarks", `Remarks updated: ${customer.remarks || "(cleared)"}`);
            }

            if (shouldForwardToTL) {
                recordCustomerActivity(customer, "forwarded", `Application forwarded to ${targetTL.name} (${targetTL.id}) for approval`);
            } else if (currentUser.role === "agent") {
                recordCustomerActivity(customer, "saved", "Application saved as a draft");
            }

            if (customer.callbackAt !== previousCallbackAt) {
                notifiedCallbackIds.delete(customer.id);
                if (!isNew) {
                    recordCustomerActivity(
                        customer,
                        "callback",
                        customer.callbackAt
                            ? `Callback scheduled for ${formatActivityDate(customer.callbackAt)}`
                            : "Callback reminder cleared"
                    );
                }
            }

            saveData();


            closeModal();

            renderCustomers();

            updateDashboard();


            if (shouldForwardToTL) {
                alert(`Application saved and forwarded to ${targetTL.name} (${targetTL.id}) for approval.`);
            } else {
                alert(isNew ? "Customer added successfully." : "Customer application saved successfully.");
            }

        }
    );


/* ================= ADD CUSTOMER ================= */



/* ================= LOAN BANK PICKERS ================= */



const LOAN_BANK_OPTIONS = [

    "Axis Bank", "IDFC First Bank", "HDFC Bank", "ICICI Bank", "State Bank of India",

    "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank", "Bank of Baroda",

    "Punjab National Bank", "Canara Bank", "Union Bank of India", "Federal Bank",

    "Bajaj Finance", "Tata Capital", "Other"

];

const loanBankSelections = {};



function loanBankPickerLabel(key) {

    const selected = loanBankSelections[key] || [];

    if (!selected.length) return '<span class="bank-picker-placeholder">Select banks</span>';

    const extra = selected.length > 1 ? `<span class="bank-picker-badge">+${selected.length - 1}</span>` : "";

    return `<span class="bank-picker-value">${escapeHTML(selected[0])}</span>${extra}`;

}



function renderLoanBankPicker(key) {

    const picker = document.querySelector(`[data-bank-picker="${key}"]`);

    if (!picker) return;

    const selected = loanBankSelections[key] || [];

    picker.classList.remove("open");

    picker.innerHTML = `

        <button type="button" class="bank-picker-btn${selected.length ? " has-value" : ""}" aria-haspopup="listbox" aria-expanded="false" title="Banks where this loan is running" onclick="toggleLoanBankPicker('${key}', event)">

            <span class="bank-picker-icon" aria-hidden="true">🏦</span>

            <span class="bank-picker-text">${loanBankPickerLabel(key)}</span>

            <span class="bank-picker-caret" aria-hidden="true">▾</span>

        </button>

        <div class="bank-picker-panel" role="listbox" aria-multiselectable="true">

            <div class="bank-picker-title">Banks for this loan</div>

            ${LOAN_BANK_OPTIONS.map(bank => `

                <label class="bank-picker-option">

                    <input type="checkbox" value="${escapeHTML(bank)}" ${selected.includes(bank) ? "checked" : ""} onchange="toggleLoanBank('${key}', this.value, this.checked)">

                    <span>${escapeHTML(bank)}</span>

                </label>

            `).join("")}

            <button type="button" class="bank-picker-clear" onclick="clearLoanBanks('${key}')">Clear selection</button>

        </div>

    `;

}



function closeLoanBankPickers(exceptKey = "") {

    document.querySelectorAll(".bank-picker.open").forEach(picker => {

        if (picker.dataset.bankPicker === exceptKey) return;

        picker.classList.remove("open");

        picker.querySelector(".bank-picker-btn")?.setAttribute("aria-expanded", "false");

    });

}



function toggleLoanBankPicker(key, event) {

    event?.stopPropagation();

    const picker = document.querySelector(`[data-bank-picker="${key}"]`);

    if (!picker) return;

    closeLoanBankPickers(key);

    const open = picker.classList.toggle("open");

    picker.querySelector(".bank-picker-btn")?.setAttribute("aria-expanded", String(open));

}



function refreshLoanBankPickerButton(key) {

    const picker = document.querySelector(`[data-bank-picker="${key}"]`);

    if (!picker) return;

    const selected = loanBankSelections[key] || [];

    picker.querySelector(".bank-picker-btn")?.classList.toggle("has-value", selected.length > 0);

    const text = picker.querySelector(".bank-picker-text");

    if (text) text.innerHTML = loanBankPickerLabel(key);

}



function toggleLoanBank(key, bank, checked) {

    const selected = new Set(loanBankSelections[key] || []);

    if (checked) selected.add(bank);

    else selected.delete(bank);

    loanBankSelections[key] = LOAN_BANK_OPTIONS.filter(option => selected.has(option));

    refreshLoanBankPickerButton(key);

}



function clearLoanBanks(key) {

    loanBankSelections[key] = [];

    renderLoanBankPicker(key);

    const picker = document.querySelector(`[data-bank-picker="${key}"]`);

    picker?.classList.add("open");

    picker?.querySelector(".bank-picker-btn")?.setAttribute("aria-expanded", "true");

}



function setLoanBankSelection(key, banks) {

    loanBankSelections[key] = Array.isArray(banks) ? [...banks] : [];

    renderLoanBankPicker(key);

}



OUTSTANDING_LOAN_FIELDS.forEach(item => setLoanBankSelection(item.key, []));

document.addEventListener("click", event => {

    if (!event.target.closest(".bank-picker")) closeLoanBankPickers();

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeLoanBankPickers();

});


function openAddCustomer() {

    if (
        currentUser.role !== "agent" &&
        currentUser.role !== "tl"
    ) {

        alert(
            "You don't have permission to add customers."
        );

        return;

    }


    document
        .getElementById("modalTitle")
        .textContent =
        "Add New Customer";


    document
        .getElementById("customerForm")
        .reset();

    document.getElementById("customerStatus").value = "Pending";
    OUTSTANDING_LOAN_FIELDS.forEach(item => setLoanBankSelection(item.key, []));

    document
        .getElementById("customerId")
        .value = "";

    document.getElementById("customerBankSummary").classList.add("hidden");
    renderCustomerHistory({ activityHistory: [] });
    renderCustomerDocuments({ documents: [] });
    updateForwardTLMessage();


    document
        .getElementById("customerModal")
        .classList.remove("hidden");


}


/* ================= EXCEL/CSV CUSTOMER UPLOAD ================= */

async function uploadCustomers(event) {
    if (!currentUser || !["manager", "backend", "assigner"].includes(currentUser.role)) {
        alert("Only managers, backend administrators, or assigners can upload customers.");
        event.target.value = "";
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    try {
        const isExcel = /\.xlsx$/i.test(file.name) ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const rows = isExcel
            ? await parseXLSX(await file.arrayBuffer())
            : parseCSV(await file.text());
        const imported = rows.map((row, index) => createCustomerFromRow(row, index));

        if (!imported.length) {
            throw new Error("No customer rows were found. Check that the first row contains column headings.");
        }

        const assignmentSummary = autoAssignImportedCustomers(imported);
        customers.push(...imported);
        saveData();
        renderCustomers();
        showSection("dashboard");
        alert(
            `${imported.length} customer(s) uploaded.\n` +
            `Auto-assigned by location and loan limits: ${assignmentSummary.assigned}\n` +
            `Left unassigned (no matching agent criteria): ${assignmentSummary.unassigned}\n\n` +
            `To match more customers, configure agent Locations, Minimum loan amount, and Maximum loan amount under Manage Agents.`
        );
    } catch (error) {
        alert(`Upload failed: ${error.message}`);
    }

    event.target.value = "";
}

async function parseXLSX(buffer) {
    if (typeof DecompressionStream === "undefined") {
        throw new Error("This browser cannot unpack Excel files. Save the worksheet as CSV and upload it instead.");
    }

    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const decoder = new TextDecoder("utf-8");
    let end = -1;

    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            end = i;
            break;
        }
    }
    if (end < 0) throw new Error("This is not a valid .xlsx file.");

    const entries = new Map();
    const entryCount = view.getUint16(end + 10, true);
    let cursor = view.getUint32(end + 16, true);

    for (let i = 0; i < entryCount; i++) {
        if (view.getUint32(cursor, true) !== 0x02014b50) {
            throw new Error("The Excel file appears to be damaged.");
        }
        const method = view.getUint16(cursor + 10, true);
        const compressedSize = view.getUint32(cursor + 20, true);
        const nameLength = view.getUint16(cursor + 28, true);
        const extraLength = view.getUint16(cursor + 30, true);
        const commentLength = view.getUint16(cursor + 32, true);
        const localOffset = view.getUint32(cursor + 42, true);
        const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
        entries.set(name, { method, compressedSize, localOffset });
        cursor += 46 + nameLength + extraLength + commentLength;
    }

    const readEntry = async name => {
        const entry = entries.get(name);
        if (!entry) return null;
        const offset = entry.localOffset;
        const nameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);
        const start = offset + 30 + nameLength + extraLength;
        const compressed = bytes.slice(start, start + entry.compressedSize);

        if (entry.method === 0) return decoder.decode(compressed);
        if (entry.method !== 8) throw new Error("This Excel file uses an unsupported compression format.");

        try {
            const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
            return await new Response(stream).text();
        } catch (error) {
            throw new Error("Could not decompress the Excel file in this browser.");
        }
    };

    const parseXML = text => {
        const xml = new DOMParser().parseFromString(text, "application/xml");
        if (xml.querySelector("parsererror")) throw new Error("The Excel workbook contains invalid XML.");
        return xml;
    };

    const workbookText = await readEntry("xl/workbook.xml");
    if (!workbookText) throw new Error("Could not find a worksheet in this Excel file.");
    const workbook = parseXML(workbookText);
    const firstSheet = workbook.getElementsByTagName("sheet")[0];
    if (!firstSheet) throw new Error("The Excel workbook has no worksheets.");

    const relationId = firstSheet.getAttribute("r:id") || firstSheet.getAttributeNS(
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"
    );
    const relationshipsText = await readEntry("xl/_rels/workbook.xml.rels");
    if (!relationshipsText) throw new Error("Could not locate the Excel worksheet.");
    const relationships = parseXML(relationshipsText);
    const relation = Array.from(relationships.getElementsByTagName("Relationship"))
        .find(item => item.getAttribute("Id") === relationId);
    if (!relation) throw new Error("Could not locate the first worksheet in the Excel file.");

    const target = relation.getAttribute("Target").replace(/^\//, "");
    const rawSheetPath = target.startsWith("xl/") ? target : `xl/${target}`;
    const sheetPath = rawSheetPath.split("/").reduce((parts, part) => {
        if (part === "..") parts.pop();
        else if (part && part !== ".") parts.push(part);
        return parts;
    }, []).join("/");
    const sheetText = await readEntry(sheetPath);
    if (!sheetText) throw new Error("Could not read the first worksheet.");
    const sheet = parseXML(sheetText);

    const sharedText = await readEntry("xl/sharedStrings.xml");
    const sharedStrings = sharedText
        ? Array.from(parseXML(sharedText).getElementsByTagName("si"))
            .map(item => Array.from(item.getElementsByTagName("t")).map(text => text.textContent).join(""))
        : [];

    const grid = Array.from(sheet.getElementsByTagName("row")).map(row => {
        const values = [];
        Array.from(row.getElementsByTagName("c")).forEach(cell => {
            const match = cell.getAttribute("r").match(/[A-Z]+/i);
            if (!match) return;
            let column = 0;
            for (const character of match[0].toUpperCase()) {
                column = column * 26 + character.charCodeAt(0) - 64;
            }
            column--;

            const type = cell.getAttribute("t");
            let value = cell.getElementsByTagName("v")[0]?.textContent || "";
            if (type === "s") value = sharedStrings[Number(value)] || "";
            if (type === "inlineStr") {
                value = Array.from(cell.getElementsByTagName("t")).map(text => text.textContent).join("");
            }
            values[column] = value;
        });
        return values;
    }).filter(row => row.some(value => String(value || "").trim()));

    if (grid.length < 2) return [];

    return rowsToCustomerRecords(grid);
}

function normalizeImportHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function canonicalImportHeader(value) {
    const header = normalizeImportHeader(value);
    const aliases = {
        name: ["name", "customer", "applicant", "borrower"],
        customername: ["customername", "applicantname", "borrowername", "fullname", "customerfullname", "applicantfullname"],
        phone: ["phone", "mobile", "mobilenumber", "phonenumber", "contactnumber", "telephone"],
        loanamount: ["loan", "loanamount", "loanvalue", "requestedloanamount"],
        salary: ["salary", "monthlysalary", "netmonthlysalary", "income"],
        cibil: ["cibil", "cibilscore", "creditscore"],
        address: ["address", "place", "city", "residence"],
        location: ["location", "locations", "state", "statecode", "statecodeabbreviation"],
        btamount: ["btamount", "balancetransferamount"],
        btbank: ["btbank", "balancebank", "existingbank"],
        inhandamount: ["inhandamount", "inhand", "netloanamount"],
        companyname: ["companyname", "company", "employer"],
        permanentaddress: ["permanentaddress", "permanentaddr"],
        personalemail: ["personalemail", "personalemailid", "email", "emailid"],
        officeemail: ["officeemail", "officeemailid", "workemail"],
        officeaddress: ["officeaddress", "companyaddress", "workaddress"],
        companybank: ["companybank", "companylistedbank"],
        enquiries: ["enquiries", "numberofenquiries", "creditenquiries"],
        creditcards: ["creditcards", "creditcard", "cardsused"],
        delays: ["delays", "delayedpayments", "paymentdelays"],
        banksapplied: ["banksapplied", "appliedbanks", "applied", "appliedwhere", "bankapplied", "alreadyapplied", "bankalreadyapplied"],
        bankspushing: ["bankspushing", "bankbeingpushed", "bankwearepushingfor", "targetbank", "preferredbank"],
        remarks: ["remarks", "callremarks", "latestremark", "latestremarks", "comments"],
        bankremarks: ["bankremark", "bankremarks"],
        teamleader: ["teamleader", "tl", "tlname"],
        branch: ["branch", "branchname"],
        callbackat: ["callbackat", "callback", "callbacktime", "callbackdatetime", "followupat", "followuptime"]
    };

    OUTSTANDING_LOAN_FIELDS.forEach(item => {
        const base = normalizeImportHeader(item.name);
        const variants = [`${base}outstanding`, `${base}outstandingamount`, `outstanding${base}`, `${base}outstandingbalance`];
        // "Credit Card" alone already means "Credit Cards Used", so only the other loans accept the bare name.
        if (item.key !== "outstandingCreditCard") variants.push(base);
        aliases[item.key.toLowerCase()] = variants;
        aliases[`${item.key.toLowerCase()}banks`] = [`${base}bank`, `${base}banks`, `${base}outstandingbank`, `${base}outstandingbanks`];
    });
    EMI_LOAN_FIELDS.forEach(item => {
        const base = normalizeImportHeader(item.name);
        aliases[item.key.toLowerCase()] = [`${base}emi`, `emi${base}`, `${base}emiamount`];
    });

    for (const [canonical, variants] of Object.entries(aliases)) {
        if (variants.includes(header)) return canonical;
    }

    // Also recognize headings with units or notes appended, such as "Loan Amount (INR)".
    for (const [canonical, variants] of Object.entries(aliases)) {
        if (variants.some(alias => header.startsWith(alias) || header.endsWith(alias))) return canonical;
    }
    return header;
}

function rowsToCustomerRecords(grid) {
    const recognizedFields = new Set([
        "name", "customername", "phone", "loanamount", "salary", "cibil",
        "address", "location", "age", "status", "agent", "agentid", "btamount", "callbackat", "banksapplied",
        "permanentaddress", "personalemail", "officeemail", "officeaddress", "companyname"
    ]);
    let headerRowIndex = 0;
    let bestHeaderScore = 0;
    grid.slice(0, 15).forEach((row, index) => {
        const score = row
            .map(canonicalImportHeader)
            .filter(header => recognizedFields.has(header)).length;
        if (score > bestHeaderScore) {
            bestHeaderScore = score;
            headerRowIndex = index;
        }
    });

    if (bestHeaderScore === 0) return [];

    const headers = grid[headerRowIndex].map(canonicalImportHeader);
    return grid.slice(headerRowIndex + 1).map(values => headers.reduce((row, header, index) => {
        if (header) row[header] = String(values[index] || "").trim();
        return row;
    }, {})).filter(row => Object.values(row).some(Boolean));
}

function parseCSV(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    const grid = lines.map(splitCSVLine);
    return rowsToCustomerRecords(grid);
}

function splitCSVLine(line) {
    const values = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
        const character = line[i];
        if (character === '"' && line[i + 1] === '"') {
            value += '"';
            i++;
        } else if (character === '"') {
            quoted = !quoted;
        } else if (character === "," && !quoted) {
            values.push(value);
            value = "";
        } else {
            value += character;
        }
    }

    values.push(value);
    return values;
}

function parseImportNumber(value) {
    const normalized = String(value || "").replace(/[^0-9.-]/g, "");
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
}

function normalizeLocationCode(value) {
    const normalized = String(value || "").trim().toUpperCase();
    const stateCodes = {
        "MAHARASHTRA": "MH",
        "ANDHRA PRADESH": "AP",
        "TELANGANA": "TL",
        "KARNATAKA": "KA",
        "TAMIL NADU": "TN",
        "KERALA": "KL",
        "DELHI": "DL",
        "GUJARAT": "GJ",
        "RAJASTHAN": "RJ",
        "UTTAR PRADESH": "UP",
        "WEST BENGAL": "WB",
        "MADHYA PRADESH": "MP",
        "PUNJAB": "PB",
        "HARYANA": "HR",
        "ODISHA": "OD",
        "BIHAR": "BR"
    };
    if (stateCodes[normalized]) return stateCodes[normalized];

    // Accept full addresses such as "Pune, Maharashtra" and state codes in a location field.
    for (const [state, code] of Object.entries(stateCodes)) {
        if (normalized.includes(state)) return code;
    }
    const codeMatch = normalized.match(/(?:^|[^A-Z])(MH|AP|TL|KA|TN|KL|DL|GJ|RJ|UP|WB|MP|PB|HR|OD|BR)(?:$|[^A-Z])/);
    return codeMatch ? codeMatch[1] : normalized;
}

function parseAgentLocations(value) {
    const locations = Array.isArray(value) ? value : String(value || "").split(/[,;|/]/);
    return [...new Set(locations.map(normalizeLocationCode).filter(Boolean))];
}

function autoAssignImportedCustomers(importedCustomers) {
    const agents = users.filter(user => user.role === "agent");
    const assignmentCounts = new Map(agents.map(agent => [
        agent.id,
        customers.filter(customer => customer.agentId === agent.id).length
    ]));
    const configuredLocationCodes = new Set(agents.flatMap(agent =>
        parseAgentLocations(agent.agentLocations || agent.locations)
    ));
    let assigned = 0;
    let unassigned = 0;

    importedCustomers.forEach(customer => {
        if (customer.agentId) {
            assignmentCounts.set(customer.agentId, (assignmentCounts.get(customer.agentId) || 0) + 1);
            assigned++;
            return;
        }

        const locationCandidates = [customer.location, customer.address]
            .map(normalizeLocationCode)
            .filter(Boolean);
        const location = locationCandidates.find(code => configuredLocationCodes.has(code)) || locationCandidates[0];
        const loanAmount = parseImportNumber(customer.loanAmount);
        const matchingAgents = agents.filter(agent => {
            const locations = parseAgentLocations(agent.agentLocations || agent.locations);
            const minimum = parseImportNumber(agent.minLoanAmount);
            const maximum = agent.maxLoanAmount === null || agent.maxLoanAmount === "" || agent.maxLoanAmount === undefined
                ? Infinity
                : parseImportNumber(agent.maxLoanAmount);
            return location && locations.includes(location) &&
                loanAmount >= minimum && loanAmount <= maximum;
        }).sort((first, second) =>
            (assignmentCounts.get(first.id) || 0) - (assignmentCounts.get(second.id) || 0)
        );

        const agent = matchingAgents[0];
        if (!agent) {
            unassigned++;
            return;
        }

        customer.agentId = agent.id;
        assignmentCounts.set(agent.id, (assignmentCounts.get(agent.id) || 0) + 1);
        assigned++;
        recordCustomerActivity(customer, "assignment", `Automatically assigned to ${agent.name}`);
    });

    return { assigned, unassigned };
}

function createCustomerFromRow(row, index) {


    
    const get = (...names) => {
        const key = names.find(name => row[name] !== undefined);
        return key ? row[key] : "";
    };

    const requestedAgentId = String(get("agentid", "agent", "assignedagent") || "").trim().toLowerCase();
    const eligibleAgents = users.filter(user => user.role === "agent");
    const assignedAgent = requestedAgentId
        ? eligibleAgents.find(user =>
            String(user.id).trim().toLowerCase() === requestedAgentId ||
            String(user.name || "").trim().toLowerCase() === requestedAgentId)
        : null;
    const importedStatusText = String(get("status") || "").trim();
    const knownImportStatuses = ["Not Called", "Call Back", "Not responded", "Not Interested", "Lead", "Pending", "Eligible", "Review", "TL Approved", "Logged In", "Underwriting", "Documents Pending", "Approved", "Rejected", "Disbursed"];
    const importedStatus = normalizeCustomerStatus(importedStatusText || "Not Called");

    const customer = {
        id: Date.now() + index,
        name: get("name", "customername", "applicantname", "customer") || `Imported Customer ${index + 1}`,
        age: parseImportNumber(get("age")),
        phone: get("phone", "mobilenumber", "mobile", "phonenumber", "contactnumber"),
        address: get("address", "place", "city", "residence"),
        location: normalizeLocationCode(get("location", "locations", "state", "statecode", "statecodeabbreviation")),
        loanAmount: parseImportNumber(get("loanamount", "loan", "loanvalue")),
        btAmount: parseImportNumber(get("btamount")),
        btBank: get("btbank"),
        inHandAmount: parseImportNumber(get("inhandamount", "inhand")),
        salary: parseImportNumber(get("salary", "monthlysalary")),
        companyName: get("companyname", "company"),
        permanentAddress: get("permanentaddress", "permanentaddr"),
        personalEmail: get("personalemail", "personalemailid", "email", "emailid"),
        motherName: get("mothername", "mother"),
        spouseName: get("spousename", "spouse"),
        officeEmail: get("officeemail", "officeemailid", "workemail"),
        officeAddress: get("officeaddress", "companyaddress", "workaddress"),
        companyBank: get("companybank", "companylistedbank"),
        cibil: parseImportNumber(get("cibil", "cibilscore")),
        enquiries: parseImportNumber(get("enquiries", "numberofenquiries")),
        creditCards: get("creditcards"),
        delays: get("delays", "delayedpayments"),
        ...Object.fromEntries(OUTSTANDING_LOAN_FIELDS.map(item => [item.key, parseImportNumber(get(item.key.toLowerCase()))])),
        ...Object.fromEntries(OUTSTANDING_LOAN_FIELDS.map(item => [
            `${item.key}Banks`,
            String(get(`${item.key.toLowerCase()}banks`) || "").split(/[,;/|]/).map(bank => bank.trim()).filter(Boolean)
        ])),
        ...Object.fromEntries(EMI_LOAN_FIELDS.map(item => [item.key, parseImportNumber(get(item.key.toLowerCase()))])),
        otherEmi: parseImportNumber(get("otheremi")),
        banksApplied: get("banksapplied"),
        banksPushing: get("bankspushing"),
        status: knownImportStatuses.includes(importedStatus) ? importedStatus : "Not Called",
        remarks: get("remarks", "callremarks"),
        bankRemarks: get("bankremarks"),
        branch: get("branch"),
        teamLeader: get("teamleader"),
        agentId: assignedAgent ? assignedAgent.id : "",
        callbackAt: get("callbackat", "callback", "callbacktime"),
        activityHistory: []
    };

    // Rows whose Status is already a bank-stage status (Approved, Rejected, Disbursed, ...)
    // must be routed to the bank backend, otherwise the bank queue never sees them.
    const bankStageStatuses = ["TL Approved", "Logged In", "Underwriting", "Documents Pending", "Approved", "Rejected", "Disbursed"];
    if (customer.banksPushing && bankStageStatuses.includes(customer.status)) {
        const tlText = String(get("teamleader") || "").trim().toLowerCase();
        const teamLeader = users.find(user => user.role === "tl" &&
            tlText && (String(user.name).toLowerCase() === tlText || String(user.id).toLowerCase() === tlText)) ||
            users.find(user => user.role === "tl" && assignedAgent && teamsMatch(user.team, assignedAgent.team));
        const routedAt = new Date().toISOString();
        customer.approvalStatus = "approved";
        customer.bankStatus = customer.status;
        customer.reviewedAt = routedAt;
        customer.bankForwardedAt = routedAt;
        customer.bankStatusUpdatedAt = routedAt;
        if (teamLeader) {
            customer.forwardedToTL = teamLeader.id;
            customer.reviewedBy = teamLeader.id;
            customer.bankForwardedBy = teamLeader.id;
            customer.bankStatusUpdatedBy = teamLeader.id;
        }
    }

    recordCustomerActivity(customer, "created", "Customer imported");
    if (assignedAgent) {
        recordCustomerActivity(customer, "assignment", `Assigned to ${assignedAgent.name}`);
    }
    return customer;
}

/* ================= CLOSE MODAL ================= */

function closeModal() {

    document
        .getElementById("customerModal")
        .classList.add("hidden");
    setCustomerModalReadOnly(false);

}


const customerModal = document.getElementById("customerModal");

customerModal.addEventListener("click", event => {
    if (event.target === customerModal) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    closeAccountMenu();
    const passwordModal = document.getElementById("changePasswordModal");
    if (passwordModal && !passwordModal.classList.contains("hidden")) {
        closeChangePassword();
    }

    const calculatorPopup = document.getElementById("calculatorPopup");
    if (calculatorPopup && !calculatorPopup.hidden) {
        calculatorPopup.hidden = true;
    }

    if (!customerModal.classList.contains("hidden")) {
        closeModal();
    }
});


/* ================= ASSIGNMENTS ================= */

function getAssignmentTargets() {
    if (currentUser.role === "tl") {
        return users.filter(user =>
            (user.role === "agent" && teamsMatch(user.team, currentUser.team)) ||
            user.id === currentUser.id
        );
    }

    if (["manager", "backend", "assigner"].includes(currentUser.role)) {
        return users.filter(user =>
            ["agent", "tl"].includes(user.role) &&
            (["backend", "assigner"].includes(currentUser.role) || teamsMatch(user.branch, currentUser.branch))
        );
    }

    return [];
}

function getAssignmentFilterMembers() {
    return users
        .filter(user => ["agent", "tl"].includes(user.role))
        .sort((first, second) => first.name.localeCompare(second.name));
}

function getCustomerBranch(customer) {
    const assignedMember = users.find(user =>
        user.id === resolveCustomerAgentId(customer.agentId)
    );
    return String(assignedMember?.branch || customer.branch || "").trim();
}

function updateAssignmentBranchFilter() {
    const select = document.getElementById("assignmentBranchFilter");
    if (!select) return;

    const currentValue = select.value;
    const branches = [...new Map([
        ...portalBranches,
        ...users
            .filter(user => ["agent", "tl", "manager"].includes(user.role))
            .map(user => String(user.branch || "").trim()),
        ...getVisibleCustomers().map(getCustomerBranch)
    ].filter(Boolean).map(branch => [branch.toLowerCase(), branch])).values()]
        .sort((first, second) => first.localeCompare(second));
    select.innerHTML = `
        <option value="all">All Branches</option>
        <option value="unassigned">No Branch</option>
        ${branches.map(branch =>
            `<option value="${escapeHTML(branch)}">${escapeHTML(branch)}</option>`
        ).join("")}
    `;
    select.value = ["all", "unassigned", ...branches].includes(currentValue)
        ? currentValue
        : "all";
}

function updateAssignmentAssigneeFilter() {
    const select = document.getElementById("assignmentAssigneeFilter");
    if (!select) return;

    const currentValue = select.value;
    const members = getAssignmentFilterMembers();
    select.innerHTML = `
        <option value="all">All Assignees</option>
        <option value="unassigned">None Assigned</option>
        ${members.map(member => `
            <option value="${escapeHTML(member.id)}">
                ${escapeHTML(member.name)} (${member.role === "tl" ? "TL" : "Agent"})
            </option>
        `).join("")}
    `;
    select.value = ["all", "unassigned", ...members.map(member => member.id)].includes(currentValue)
        ? currentValue
        : "all";
}

function getFilteredAssignmentCustomers() {
    const assignmentStatus = document.getElementById("assignmentStatusFilter")?.value || "all";
    const assignee = document.getElementById("assignmentAssigneeFilter")?.value || "all";
    const branch = document.getElementById("assignmentBranchFilter")?.value || "all";
    const customerStatus = document.getElementById("statusFilter")?.value || "all";
    // Agents never see the assignment filter controls, so they must never be filtered by them.
    const useAssignmentFilters = currentUser?.role !== "agent";

    return filterCustomers(getVisibleCustomers(), "customer").filter(customer => {
        if (!useAssignmentFilters) {
            return customerStatus === "all" || normalizeCustomerStatus(customer.status) === customerStatus;
        }
        const customerBranch = getCustomerBranch(customer);
        if (branch === "unassigned" && customerBranch) return false;
        if (branch !== "all" && branch !== "unassigned" &&
            customerBranch.toLowerCase() !== branch.toLowerCase()) return false;
        if (customerStatus !== "all" && normalizeCustomerStatus(customer.status) !== customerStatus) return false;
        if (assignmentStatus === "unassigned" && customer.agentId) return false;
        if (assignmentStatus === "assigned" && !customer.agentId) return false;
        if (assignee === "unassigned") return !customer.agentId;
        if (assignee !== "all") return customer.agentId === assignee;
        return true;
    });
}

function getAssignmentSelectionLimit() {
    const value = document.getElementById("assignmentSelectCount")?.value.trim();
    if (!value) return null;

    const count = Number(value);
    return Number.isInteger(count) && count > 0 ? count : null;
}

function renderAssignments() {
    updateAssignmentBranchFilter();
    updateAssignmentAssigneeFilter();

    const assignmentTargets = getAssignmentTargets();
    const bulkAgentSelect = document.getElementById("bulkAssignmentAgent");
    if (bulkAgentSelect) {
        const currentValue = bulkAgentSelect.value;
        bulkAgentSelect.innerHTML = `<option value="">Select assignee</option>` + assignmentTargets.map(target =>
            `<option value="${escapeHTML(target.id)}">${escapeHTML(target.name)} (${escapeHTML(target.id)}) - ${target.role.toUpperCase()}</option>`
        ).join("");
        bulkAgentSelect.value = assignmentTargets.some(target => target.id === currentValue) ? currentValue : "";
    }
    updateAssignmentSelectionControls(getFilteredAssignmentCustomers());
}

function toggleAssignmentSelection(id, isSelected) {
    const selectionLimit = getAssignmentSelectionLimit();
    if (isSelected && selectionLimit !== null) {
        const allowedIds = new Set(
            getFilteredAssignmentCustomers()
                .slice(0, selectionLimit)
                .map(customer => customer.id)
        );
        if (!allowedIds.has(id)) return;
    }

    if (isSelected) {
        selectedAssignmentCustomerIds.add(id);
        selectedCustomerIds.add(id);
    } else {
        selectedAssignmentCustomerIds.delete(id);
        selectedCustomerIds.delete(id);
    }
    renderCustomers();
}

function toggleAllAssignments(checkbox) {
    const filteredCustomers = getFilteredAssignmentCustomers();
    const selectionLimit = getAssignmentSelectionLimit();
    const customersToSelect = selectionLimit === null
        ? filteredCustomers
        : filteredCustomers.slice(0, selectionLimit);

    if (checkbox.checked) {
        customersToSelect.forEach(customer => {
            selectedAssignmentCustomerIds.add(customer.id);
            selectedCustomerIds.add(customer.id);
        });
    } else if (selectionLimit !== null) {
        selectedAssignmentCustomerIds.clear();
        selectedCustomerIds.clear();
    } else {
        filteredCustomers.forEach(customer => {
            selectedAssignmentCustomerIds.delete(customer.id);
            selectedCustomerIds.delete(customer.id);
        });
    }

    renderCustomers();
}

function selectAssignmentCount() {
    const input = document.getElementById("assignmentSelectCount");
    const requestedCount = Number(input.value);

    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
        alert("Enter a whole number of at least 1.");
        input.focus();
        return;
    }

    const filteredCustomers = getFilteredAssignmentCustomers();

    // Replace the selection so only the first N filtered rows remain selected.
    selectedAssignmentCustomerIds = new Set(filteredCustomers.slice(0, requestedCount).map(customer => customer.id));
    selectedCustomerIds = new Set(selectedAssignmentCustomerIds);

    renderCustomers();
}

function updateAssignmentSelectionControls(filteredCustomers) {
    const selectedVisible = filteredCustomers.filter(customer =>
        selectedAssignmentCustomerIds.has(customer.id)
    ).length;
    const selectedAccessible = getVisibleCustomers().filter(customer =>
        selectedAssignmentCustomerIds.has(customer.id)
    ).length;
    const count = document.getElementById("assignmentSelectionCount");
    const selectAll = document.getElementById("selectAllAssignments");
    const customerSelectAll = document.getElementById("selectAllCustomers");
    if (count) count.textContent = `${selectedAccessible} selected`;
    if (selectAll) {
        selectAll.checked = filteredCustomers.length > 0 && selectedVisible === filteredCustomers.length;
        selectAll.indeterminate = selectedVisible > 0 && selectedVisible < filteredCustomers.length;
    }
    if (customerSelectAll) {
        customerSelectAll.checked = filteredCustomers.length > 0 && selectedVisible === filteredCustomers.length;
        customerSelectAll.indeterminate = selectedVisible > 0 && selectedVisible < filteredCustomers.length;
    }
}

async function bulkAssignCustomers() {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!["tl", "manager", "backend", "assigner"].includes(role)) {
        alert("You don't have permission to assign customers.");
        return;
    }

    const assigneeId = document.getElementById("bulkAssignmentAgent").value;
    const accessibleIds = new Set(getVisibleCustomers().map(customer => customer.id));
    const selectedIds = [...selectedAssignmentCustomerIds].filter(id => accessibleIds.has(id));
    const assignmentTargets = getAssignmentTargets();
    const assignee = assignmentTargets.find(target => target.id === assigneeId);

    if (!assigneeId || !assignee) {
        alert("Select an assignee first.");
        return;
    }
    if (role === "tl" && assignee.id !== currentUser.id && !teamsMatch(assignee.team, currentUser.team)) {
        alert("You can only assign customers to yourself or agents in your team.");
        return;
    }
    if (!selectedIds.length) {
        alert("Select at least one customer.");
        return;
    }
    if (!confirm(`Assign ${selectedIds.length} customer(s) to ${assignee.name}?`)) return;

    const previousCustomers = JSON.stringify(customers);
    const selectedSet = new Set(selectedIds);
    customers.forEach(customer => {
        if (!selectedSet.has(customer.id)) return;

        const previousAgentId = customer.agentId || "";
        customer.agentId = assignee.id;
        if (previousAgentId !== assignee.id) {
            recordCustomerActivity(customer, "assignment", `Assigned to ${assignee.name}`);
        }
    });
    try {
        await saveData();
    } catch (error) {
        customers = JSON.parse(previousCustomers);
        alert(`Could not save customer assignments: ${error.message}`);
        renderCustomers();
        return;
    }
    selectedAssignmentCustomerIds.clear();
    selectedCustomerIds.clear();
    renderCustomers();
    renderAssignments();
    updateDashboard();
    alert(`${selectedIds.length} customer(s) assigned successfully.`);
}

async function autoAssignSelectedCustomers() {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!["tl", "manager", "backend", "assigner"].includes(role)) {
        alert("You don't have permission to assign customers.");
        return;
    }

    const accessibleCustomers = getVisibleCustomers();
    const accessibleById = new Map(accessibleCustomers.map(customer => [customer.id, customer]));
    const selectedCustomers = [...selectedAssignmentCustomerIds]
        .map(id => accessibleById.get(id))
        .filter(Boolean);
    const agents = getAssignmentTargets().filter(user => user.role === "agent");

    if (!selectedCustomers.length) {
        alert("Select at least one customer.");
        return;
    }
    if (!agents.length) {
        alert("No agents are available for assignment.");
        return;
    }
    if (!confirm(`Auto assign ${selectedCustomers.length} selected customer(s) as evenly as possible across ${agents.length} agent(s)?`)) {
        return;
    }

    const previousCustomers = JSON.stringify(customers);
    const assignmentCounts = new Map(agents.map(agent => [agent.id, 0]));
    const assignedCounts = new Map(agents.map(agent => [agent.id, 0]));

    selectedCustomers.forEach(customer => {
        const agent = agents.reduce((leastAssigned, candidate) =>
            assignmentCounts.get(candidate.id) < assignmentCounts.get(leastAssigned.id)
                ? candidate
                : leastAssigned
        );

        const previousAgentId = customer.agentId || "";
        customer.agentId = agent.id;
        assignmentCounts.set(agent.id, assignmentCounts.get(agent.id) + 1);
        assignedCounts.set(agent.id, assignedCounts.get(agent.id) + 1);

        if (previousAgentId !== agent.id) {
            recordCustomerActivity(customer, "assignment", `Assigned to ${agent.name} by equal auto-assignment`);
        }
    });

    try {
        await saveData();
    } catch (error) {
        customers = JSON.parse(previousCustomers);
        alert(`Could not save auto-assignment: ${error.message}`);
        renderCustomers();
        return;
    }
    selectedAssignmentCustomerIds.clear();
    selectedCustomerIds.clear();
    renderCustomers();
    renderAssignments();
    updateDashboard();

    const summary = agents
        .filter(agent => assignedCounts.get(agent.id) > 0)
        .map(agent => `${agent.name}: ${assignedCounts.get(agent.id)}`)
        .join("\n");
    alert(`Auto-assignment complete.\n${summary}`);
}


/* ================= REASSIGN ================= */

async function reassignCustomer(id) {

    if (
        currentUser.role !== "tl" &&
        currentUser.role !== "manager" &&
        currentUser.role !== "backend" &&
        currentUser.role !== "assigner"
    ) {

        return;

    }


    const select =
        document.getElementById(
            `agent-${id}`
        );


    const newAgent =
        select.value;

    const assignmentTarget = getAssignmentTargets().find(target => target.id === newAgent);
    if (newAgent && !assignmentTarget) {
        alert("You don't have permission to assign this customer to that user.");
        return;
    }


    const customer = getVisibleCustomers().find(c => Number(c.id) === Number(id));


    if (!customer) return;

    const previousCustomers = JSON.stringify(customers);
    const previousAgentId = customer.agentId || "";
    customer.agentId = newAgent;

    if (previousAgentId !== newAgent) {
        const assignedAgent = users.find(user => user.id === newAgent);
        recordCustomerActivity(
            customer,
            "assignment",
            assignedAgent ? `Assigned to ${assignedAgent.name}` : "Customer unassigned"
        );
    }

    try {
        await saveData();
    } catch (error) {
        customers = JSON.parse(previousCustomers);
        alert(`Could not save customer reassignment: ${error.message}`);
        renderCustomers();
        return;
    }
    renderCustomers();
    renderAssignments();

    updateDashboard();


    alert(
        "Customer assigned successfully."
    );

}


/* ================= TL LEAD REVIEW ================= */

function renderLeadsToApprove() {
    const body = document.getElementById("leadsToApproveTableBody");
    if (!body || currentUser?.role !== "tl") return;

    const dateFrom = document.getElementById("leadsFilterDateFrom")?.value || "";
    const dateTo = document.getElementById("leadsFilterDateTo")?.value || "";
    const leads = getVisibleCustomers().filter(customer =>
        customer.forwardedToTL === currentUser.id && customer.approvalStatus === "pending" &&
        matchesDateTimeRange(customer, dateFrom, dateTo, getCustomerForwardedDate)
    );

    body.innerHTML = leads.length ? leads.map(customer => {
        const agent = resolveCustomerAgent(customer);
        const documentCount = Array.isArray(customer.documents) ? customer.documents.length : 0;
        return `
            <tr>
                <td><strong>${escapeHTML(customer.name || "Unnamed customer")}</strong><span class="customer-phone">${escapeHTML(customer.phone || "")}</span></td>
                <td>${escapeHTML(agent?.name || customer.agentId || "Unknown agent")}</td>
                <td>${formatMoney(customer.loanAmount)}</td>
                <td>${documentCount}</td>
                <td>${escapeHTML(bankNameForCustomer(customer) || "Not selected")}</td>
                <td>${escapeHTML(formatActivityDate(customer.forwardedAt))}</td>
                <td>
                    <label class="tl-return-label" for="tlReturnComment-${Number(customer.id)}">Reason for return (required)</label>
                    <textarea
                        id="tlReturnComment-${Number(customer.id)}"
                        class="tl-return-comment"
                        maxlength="1000"
                        rows="2"
                        placeholder="Explain what the agent needs to update"
                        aria-label="Required reason for returning ${escapeHTML(customer.name || "customer")} to the agent"
                    ></textarea>
                    <button type="button" class="action-btn" onclick="openCustomer(${Number(customer.id)})">Review</button>
                    <button type="button" class="primary-btn" onclick="decideForwardedLead(${Number(customer.id)}, 'approved')">Approve</button>
                    <button type="button" class="delete-customer-btn" onclick="decideForwardedLead(${Number(customer.id)}, 'returned')">Return to Agent</button>
                </td>
            </tr>
        `;
    }).join("") : '<tr><td colspan="7" style="text-align:center;padding:40px;">No applications are waiting for approval.</td></tr>';
}

function decideForwardedLead(customerId, decision) {
    if (currentUser?.role !== "tl" || !["approved", "returned"].includes(decision)) return;
    const customer = customers.find(item => item.id === customerId);
    if (!customer || customer.forwardedToTL !== currentUser.id || customer.approvalStatus !== "pending") {
        alert("This application is no longer waiting for your review.");
        renderLeadsToApprove();
        return;
    }

    const returnCommentInput = decision === "returned"
        ? document.getElementById(`tlReturnComment-${Number(customerId)}`)
        : null;
    const returnComment = returnCommentInput?.value.trim() || "";
    if (decision === "returned" && !returnComment) {
        alert("Add a comment explaining why this application is being returned and what the agent must update.");
        returnCommentInput?.focus();
        return;
    }

    if (decision === "approved") {
        const bankName = String(customer.banksPushing || "").trim();
        if (!bankName) {
            alert("Set “Bank we are pushing for” on the customer application before approving it.");
            return;
        }
    }

    const action = decision === "approved" ? "Approve" : "Return";
    if (!confirm(`${action} ${customer.name}'s application?`)) return;

    customer.approvalStatus = decision;
    customer.reviewedAt = new Date().toISOString();
    customer.reviewedBy = currentUser.id;
    if (decision === "returned") {
        customer.tlReturnComment = returnComment;
        customer.tlReturnAt = customer.reviewedAt;
        customer.tlReturnBy = currentUser.id;
    }
    if (decision === "approved") {
        const bankName = bankNameForCustomer(customer);
        const appliedBanks = String(customer.banksApplied || "")
            .split(",")
            .map(bank => bank.trim())
            .filter(Boolean);
        if (!appliedBanks.some(bank => normalizeBankName(bank) === normalizeBankName(bankName))) {
            appliedBanks.push(bankName);
        }
        customer.banksApplied = appliedBanks.join(", ");
        customer.bankStatus = "TL Approved";
        customer.status = "TL Approved";
        customer.bankForwardedAt = customer.reviewedAt;
        customer.bankForwardedBy = currentUser.id;
        customer.bankStatusUpdatedAt = customer.reviewedAt;
        customer.bankStatusUpdatedBy = currentUser.id;
    }
    recordCustomerActivity(
        customer,
        "approval",
        decision === "approved"
            ? `Application approved by ${currentUser.name}`
            : `Application returned to ${resolveCustomerAgent(customer)?.name || "the agent"} for updates: ${returnComment}`
    );
    if (decision === "approved") {
        recordCustomerActivity(customer, "bank-forwarded", `Application forwarded to ${bankNameForCustomer(customer)} bank backend`);
    }
    saveData();
    renderLeadsToApprove();
    if (decision === "approved") renderTLBankApplications();
    renderCustomers();
    updateDashboard();
    if (decision === "approved") {
        alert(`${customer.name}'s application is approved and its status is now "TL Approved".`);
    }
}

function bankNameForCustomer(customer) {
    return String(customer?.banksPushing || "").trim();
}

function renderTLBankApplications() {
    if (currentUser?.role !== "tl") return;

    const applications = getVisibleCustomers()
        .filter(customer =>
            customer.approvalStatus === "approved" &&
            customer.bankForwardedBy === currentUser.id
        )
        .sort((a, b) =>
            new Date(b.bankForwardedAt || b.reviewedAt || 0) -
            new Date(a.bankForwardedAt || a.reviewedAt || 0)
        );

    const pageConfig = [
        {
            key: "sent",
            bodyId: "tlBankApplicationsTableBody",
            descriptionId: "tlBankApplicationsDescription",
            bankId: "tlBankBankFilter",
            emptyMessage: "No applications are currently being processed by the bank.",
            accepts: status => status !== "Approved" && status !== "Rejected"
        },
        {
            key: "approved",
            bodyId: "tlApprovedApplicationsTableBody",
            descriptionId: "tlApprovedApplicationsDescription",
            bankId: "tlApprovedBankFilter",
            emptyMessage: "No bank-approved applications found.",
            accepts: status => status === "Approved"
        },
        {
            key: "rejected",
            bodyId: "tlRejectedApplicationsTableBody",
            descriptionId: "tlRejectedApplicationsDescription",
            bankId: "tlRejectedBankFilter",
            emptyMessage: "No bank-rejected applications found.",
            accepts: status => status === "Rejected"
        }
    ];

    pageConfig.forEach(page => {
        const body = document.getElementById(page.bodyId);
        if (!body) return;

        const filters = tlBankApplicationFilters[page.key];
        const categorized = applications.filter(customer =>
            page.accepts(normalizeBankProcessingStatus(customer.bankStatus)) &&
            matchesDateTimeRange(customer, filters.from, filters.to, getCustomerBankForwardedDate)
        );
        const banks = [...new Set(categorized
            .map(bankNameForCustomer)
            .filter(Boolean))]
            .sort((a, b) => a.localeCompare(b));
        const bankFilter = document.getElementById(page.bankId);
        if (bankFilter) {
            bankFilter.innerHTML = '<option value="">All banks</option>' +
                banks.map(bank => `<option value="${escapeHTML(bank)}">${escapeHTML(bank)}</option>`).join("");
            if (banks.includes(filters.bank)) bankFilter.value = filters.bank;
            else filters.bank = "";
        }

        const search = filters.search.trim().toLowerCase();
        const visibleApplications = categorized.filter(customer => {
            const agent = resolveCustomerAgent(customer);
            const matchesBank = !filters.bank || bankNameForCustomer(customer) === filters.bank;
            const searchable = [
                customer.name,
                customer.phone,
                customer.id,
                customer.bankApplicationNumber,
                customer.bankRemarks,
                agent?.name,
                agent?.id
            ].join(" ").toLowerCase();
            return matchesBank && (!search || searchable.includes(search));
        });
        const description = document.getElementById(page.descriptionId);
        if (description) {
            const label = page.key === "sent" ? "being processed by the bank" : `marked ${page.key} by the bank`;
            description.textContent = `${visibleApplications.length} of ${categorized.length} applications ${label}`;
        }

        body.innerHTML = visibleApplications.length
            ? visibleApplications.map(customer => {
                const agent = resolveCustomerAgent(customer);
                const updatedBy = users.find(user => user.id === customer.bankStatusUpdatedBy);
                const status = normalizeBankProcessingStatus(customer.bankStatus);
                return `
                    <tr>
                        <td>
                            <strong>${escapeHTML(customer.name || "Unnamed customer")}</strong>
                            <span class="customer-phone">${escapeHTML(customer.phone || "")}</span>
                            <small class="customer-phone">Application #${Number(customer.id)}</small>
                        </td>
                        <td>${escapeHTML(agent?.name || customer.agentId || "Unknown agent")}</td>
                        <td>${formatMoney(customer.loanAmount)}</td>
                        <td>${escapeHTML(bankNameForCustomer(customer) || "—")}</td>
                        <td>${escapeHTML(formatActivityDate(customer.bankForwardedAt || customer.reviewedAt))}</td>
                        <td>${escapeHTML(customer.bankApplicationNumber || "Not assigned")}</td>
                        <td><span class="status ${status.toLowerCase().replace(/\s+/g, "-")}">${escapeHTML(status)}</span></td>
                        <td>${escapeHTML(customer.bankRemarks || "—")}</td>
                        <td>
                            ${escapeHTML(updatedBy?.name || customer.bankStatusUpdatedBy || "—")}
                            <span class="customer-phone">${escapeHTML(formatActivityDate(customer.bankStatusUpdatedAt || customer.bankForwardedAt))}</span>
                        </td>
                        <td><a class="action-btn" href="#" target="customerSheet" onclick="return openCustomerSheet(event, ${Number(customer.id)})">View Sheet</a></td>
                    </tr>
                `;
            }).join("")
            : `<tr><td colspan="10" style="text-align:center;padding:40px;">${escapeHTML(page.emptyMessage)}</td></tr>`;
    });
}

function setTLBankApplicationFilter(page, filter, value) {
    if (!Object.prototype.hasOwnProperty.call(tlBankApplicationFilters, page)) return;
    if (!["search", "bank", "from", "to"].includes(filter)) return;
    tlBankApplicationFilters[page][filter] = value;
    renderTLBankApplications();
}

function renderBankApplications() {
    const body = document.getElementById("bankQueueTableBody");
    if (!body || currentUser?.role !== "bank_backend") return;

    const dateFrom = document.getElementById("bankQueueDateFrom")?.value || "";
    const dateTo = document.getElementById("bankQueueDateTo")?.value || "";
    const applications = getVisibleCustomers().filter(customer =>
        matchesDateTimeRange(customer, dateFrom, dateTo, getCustomerBankForwardedDate)
    );
    const statusCounts = applications.reduce((counts, customer) => {
        const status = normalizeBankProcessingStatus(customer.bankStatus);
        counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, {});
    const tabCounts = {
        all: applications.length,
        "TL Approved": statusCounts["TL Approved"] || 0,
        "Logged In": statusCounts["Logged In"] || 0,
        Underwriting: statusCounts.Underwriting || 0,
        "Documents Pending": statusCounts["Documents Pending"] || 0,
        Approved: statusCounts.Approved || 0,
        Rejected: statusCounts.Rejected || 0,
        Disbursed: statusCounts.Disbursed || 0
    };
    const tabCountElements = {
        all: "bankQueueCountAll",
        "TL Approved": "bankQueueCountTlApproved",
        "Logged In": "bankQueueCountLoggedIn",
        Underwriting: "bankQueueCountUnderwriting",
        "Documents Pending": "bankQueueCountDocumentsPending",
        Approved: "bankQueueCountApproved",
        Rejected: "bankQueueCountRejected",
        Disbursed: "bankQueueCountDisbursed"
    };
    Object.entries(tabCountElements).forEach(([status, elementId]) => {
        const element = document.getElementById(elementId);
        if (element) element.textContent = tabCounts[status];
    });
    document.querySelectorAll(".bank-queue-tab").forEach(tab => {
        const isActive = tab.dataset.bankStatus === bankQueueStatusFilter;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    const visibleApplications = bankQueueStatusFilter === "all"
        ? applications
        : applications.filter(customer =>
            normalizeBankProcessingStatus(customer.bankStatus) === bankQueueStatusFilter
        );
    const queueTitle = bankQueueStatusFilter === "all"
        ? `All applications · ${applications.length}`
        : `${bankQueueStatusFilter} applications · ${visibleApplications.length}`;
    const description = document.getElementById("bankQueueDescription");
    if (description) description.textContent = `${currentUser.bankName} · ${queueTitle}`;

    body.innerHTML = visibleApplications.length
        ? visibleApplications.map(customer => {
            const status = normalizeBankProcessingStatus(customer.bankStatus);
            const options = BANK_PROCESSING_STATUSES.map(option =>
                `<option value="${option}" ${option === status ? "selected" : ""}>${option}</option>`
            ).join("");
            return `
                <tr>
                    <td>
                        <strong>${escapeHTML(customer.name || "Unnamed customer")}</strong>
                        <span class="customer-phone">${escapeHTML(customer.phone || "No phone")}</span>
                        <small class="customer-phone">Bank application #: ${escapeHTML(customer.bankApplicationNumber || "Not yet assigned")}</small>
                        <small class="customer-phone">Bank: ${escapeHTML(bankNameForCustomer(customer))}</small>
                    </td>
                    <td>
                        <strong>${formatMoney(customer.loanAmount)}</strong>
                        <span class="customer-phone">BT: ${formatMoney(customer.btAmount)}</span>
                        <span class="customer-phone">Salary: ${formatMoney(customer.salary)}</span>
                        <span class="customer-phone">CIBIL: ${escapeHTML(customer.cibil ?? "—")}</span>
                    </td>
                    <td>
                        <span>${escapeHTML(customer.address || "—")}</span>
                        <span class="customer-phone">${escapeHTML(customer.location || "")}</span>
                        <span class="customer-phone">${escapeHTML(customer.personalEmail || "")}</span>
                    </td>
                    <td>
                        ${(customer.documents || []).length
                            ? `<button type="button" class="action-btn" onclick="downloadBankCustomerDocuments(${Number(customer.id)})">Download ${(customer.documents || []).length} file(s)</button>`
                            : '<span class="customer-phone">No uploaded files</span>'}
                    </td>
                    <td>
                        ${escapeHTML(users.find(user => user.id === customer.reviewedBy)?.name || customer.reviewedBy || "—")}
                        <span class="customer-phone">${escapeHTML(formatActivityDate(customer.reviewedAt))}</span>
                    </td>
                    <td>
                        <input
                            id="bankApplicationNumber-${Number(customer.id)}"
                            type="text"
                            maxlength="80"
                            value="${escapeHTML(customer.bankApplicationNumber || "")}"
                            placeholder="Enter bank application number"
                            aria-label="Bank application number for ${escapeHTML(customer.name)}"
                        >
                    </td>
                    <td>
                        <select id="bankStatus-${Number(customer.id)}" aria-label="Bank status for ${escapeHTML(customer.name)}">
                            ${options}
                        </select>
                    </td>
                    <td>
                        <input id="bankRemarks-${Number(customer.id)}" maxlength="500" value="${escapeHTML(customer.bankRemarks || "")}" placeholder="Add a remark visible on the customer file" aria-label="Customer-visible bank remark for ${escapeHTML(customer.name)}">
                    </td>
                    <td>
                        <a class="action-btn" href="#" target="customerSheet" onclick="return openCustomerSheet(event, ${Number(customer.id)})">View Sheet</a>
                        <button type="button" class="primary-btn" onclick="updateBankApplication(${Number(customer.id)})">Save Update</button>
                    </td>
                </tr>
            `;
        }).join("")
        : '<tr><td colspan="9" style="text-align:center;padding:40px;">No applications have been approved and routed to your bank yet.</td></tr>';
}

function setBankQueueStatusFilter(status) {
    if (currentUser?.role !== "bank_backend") return;
    if (status !== "all" && !BANK_PROCESSING_STATUSES.includes(status)) {
        alert("Choose a valid bank application page.");
        return;
    }
    bankQueueStatusFilter = status;
    renderBankApplications();
}

async function downloadBankCustomerDocuments(customerId) {
    if (currentUser?.role !== "bank_backend") {
        alert("Only bank-backend users can download files from bank applications.");
        return;
    }

    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(customerId));
    if (!customer) {
        alert("This application is not assigned to your bank.");
        return;
    }

    const documents = Array.isArray(customer.documents) ? customer.documents : [];
    if (!documents.length) {
        alert("No files have been uploaded for this application.");
        return;
    }

    const failed = [];
    for (const item of documents) {
        try {
            const file = await getStoredCustomerDocument(item.id);
            if (!file) throw new Error("File unavailable");

            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = item.name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
            failed.push(`${item.name} (${error.message})`);
        }
    }

    if (failed.length) {
        alert(`Could not download: ${failed.join(", ")}.`);
    }
}

async function updateBankApplication(customerId) {
    if (currentUser?.role !== "bank_backend") {
        alert("Only bank-backend users can update bank application details.");
        return;
    }

    const customer = getVisibleCustomers().find(item => Number(item.id) === Number(customerId));
    if (!customer) {
        alert("This application is not assigned to your bank.");
        renderBankApplications();
        return;
    }

    const applicationNumberInput = document.getElementById(`bankApplicationNumber-${Number(customerId)}`);
    const applicationNumber = applicationNumberInput?.value.trim() || "";
    if (applicationNumber.length > 80) {
        alert("Bank application number must be 80 characters or fewer.");
        return;
    }

    const status = document.getElementById(`bankStatus-${Number(customerId)}`)?.value;
    if (!BANK_PROCESSING_STATUSES.includes(status)) {
        alert("Choose a valid bank processing status.");
        return;
    }

    const remarks = document.getElementById(`bankRemarks-${Number(customerId)}`)?.value.trim() || "";
    const previousCustomers = JSON.stringify(customers);
    const previousStatus = normalizeBankProcessingStatus(customer.bankStatus);
    const previousRemarks = customer.bankRemarks || "";
    const previousApplicationNumber = customer.bankApplicationNumber || "";
    customer.bankStatus = status;
    customer.status = status;
    customer.bankRemarks = remarks;
    customer.bankApplicationNumber = applicationNumber;
    customer.bankStatusUpdatedAt = new Date().toISOString();
    customer.bankStatusUpdatedBy = currentUser.id;
    if (status !== previousStatus || remarks !== previousRemarks || applicationNumber !== previousApplicationNumber) {
        const applicationNumberUpdate = applicationNumber !== previousApplicationNumber
            ? `; bank application number ${applicationNumber || "cleared"}`
            : "";
        recordCustomerActivity(
            customer,
            "bank-status",
            `Bank application updated to ${status}${applicationNumberUpdate}${remarks ? `: ${remarks}` : ""}`
        );
    }

    try {
        await saveData();
    } catch (error) {
        customers = JSON.parse(previousCustomers);
        renderBankApplications();
        renderTLBankApplications();
        renderCustomers();
        alert(`Could not save bank application details: ${error.message}`);
        return;
    }
    renderBankApplications();
    renderTLBankApplications();
    updateDashboard();
    renderCustomers();
    renderPerformanceLoanAmounts();
    alert("Bank application details saved.");
}

/* ================= AGENT MANAGEMENT ================= */

document
    .getElementById("agentForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        if (!currentUser || (currentUser.role !== "manager" && currentUser.role !== "backend")) {
            alert("Only managers or backend administrators can add team members.");
            return;
        }

        const id = document.getElementById("newAgentId").value.trim().toUpperCase();
        const name = document.getElementById("newAgentName").value.trim();
        const password = document.getElementById("newAgentPassword").value;
        const role = currentManagementPage;
        const hasAssignmentCriteria = ["agent", "tl"].includes(role);
        const team = hasAssignmentCriteria ? document.getElementById("newAgentTeam").value.trim() : "";
        const bankName = role === "bank_backend" ? document.getElementById("newAgentBank").value.trim() : "";
        const floor = role === "higher_management" ? "" : document.getElementById("newAgentFloor").value.trim();
        const branch = role === "higher_management"
            ? ""
            : currentUser.role === "manager"
                ? currentUser.branch
                : document.getElementById("newAgentBranch").value.trim();
        const agentLocations = hasAssignmentCriteria
            ? parseAgentLocations(document.getElementById("newAgentLocations").value)
            : [];
        const minLoanAmount = hasAssignmentCriteria
            ? Number(document.getElementById("newAgentMinLoan").value) || 0
            : 0;
        const maxLoanInput = hasAssignmentCriteria
            ? document.getElementById("newAgentMaxLoan").value.trim()
            : "";
        const maxLoanAmount = maxLoanInput ? Number(maxLoanInput) : null;

        if (!['agent', 'tl', 'manager', 'assigner', 'bank_backend', 'higher_management'].includes(role)) {
            alert("Choose a valid team-member role.");
            return;
        }
        if (role === "bank_backend" && !bankName) {
            alert("Enter the bank assigned to this bank-backend account.");
            return;
        }
        if (["agent", "tl"].includes(role) && !team) {
            alert("Enter a team for agents and team leaders.");
            return;
        }
        if (branch && !portalBranches.some(existing => existing.toLowerCase() === branch.toLowerCase())) {
            alert("Select a branch configured by the backend administrator.");
            return;
        }
        if (maxLoanAmount !== null && (!Number.isFinite(maxLoanAmount) || maxLoanAmount < minLoanAmount)) {
            alert("Maximum loan amount must be greater than or equal to the minimum.");
            return;
        }

        if (currentUser.role === "manager" && role !== "agent") {
            alert("Managers can only add agents.");
            return;
        }

        if (!/^[A-Z0-9_-]+$/.test(id)) {
            alert("Login ID can contain only letters, numbers, hyphens, and underscores.");
            return;
        }

        if (users.some(user => user.id.toUpperCase() === id)) {
            alert("That Login ID is already in use.");
            return;
        }

        users.push({
            id,
            name,
            password,
            role,
            team,
            bankName,
            branch,
            floor,
            agentLocations,
            minLoanAmount,
            maxLoanAmount,
            isCustom: true
        });

        saveAgents();
        event.target.reset();
        document.getElementById("newAgentTeam").value = "TEAM01";
        document.getElementById("newAgentBranch").value = currentUser.role === "manager" ? currentUser.branch : "";
        renderAgents();
        renderBranchManagement();
        alert(`${{ tl: "Team Leader", bank_backend: "Bank Backend", higher_management: "Higher Management" }[role] || role.charAt(0).toUpperCase() + role.slice(1)} added successfully.`);
    });

document
    .getElementById("editAgentForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser || currentUser.role !== "backend") {
            alert("Only backend administrators can edit team-member information.");
            return;
        }

        const originalId = document.getElementById("editAgentOriginalId").value;
        const member = users.find(user => user.id === originalId);
        const id = document.getElementById("editAgentId").value.trim().toUpperCase();
        const name = document.getElementById("editAgentName").value.trim();
        const password = document.getElementById("editAgentPassword").value;
        const role = document.getElementById("editAgentRole").value;
        const hasAssignmentCriteria = ["agent", "tl"].includes(role);
        const team = hasAssignmentCriteria ? document.getElementById("editAgentTeam").value.trim() : "";
        const bankName = role === "bank_backend" ? document.getElementById("editAgentBank").value.trim() : "";
        const floor = role === "higher_management" ? "" : document.getElementById("editAgentFloor").value.trim();
        const branch = role === "higher_management" ? "" : document.getElementById("editAgentBranch").value.trim();
        const agentLocations = hasAssignmentCriteria
            ? parseAgentLocations(document.getElementById("editAgentLocations").value)
            : [];
        const minLoanAmount = hasAssignmentCriteria
            ? Number(document.getElementById("editAgentMinLoan").value) || 0
            : 0;
        const maxLoanInput = hasAssignmentCriteria
            ? document.getElementById("editAgentMaxLoan").value.trim()
            : "";
        const maxLoanAmount = maxLoanInput ? Number(maxLoanInput) : null;

        if (!member || !["agent", "tl", "manager", "bank_backend", "higher_management"].includes(member.role)) {
            alert("Team member not found.");
            return;
        }
        if (!/^[A-Z0-9_-]+$/.test(id)) {
            alert("Login ID can contain only letters, numbers, hyphens, and underscores.");
            return;
        }
        if (users.some(user => user.id.toUpperCase() === id && user.id !== originalId)) {
            alert("That Login ID is already in use.");
            return;
        }
        if (!['agent', 'tl', 'manager', 'assigner', 'bank_backend', 'higher_management'].includes(role)) {
            alert("Choose a valid team-member role.");
            return;
        }
        if (role === "bank_backend" && !bankName) {
            alert("Enter the bank assigned to this bank-backend account.");
            return;
        }
        if (["agent", "tl"].includes(role) && !team) {
            alert("Enter a team for agents and team leaders.");
            return;
        }
        if (branch && !portalBranches.some(existing => existing.toLowerCase() === branch.toLowerCase())) {
            alert("Select a branch configured by the backend administrator.");
            return;
        }
        if (maxLoanAmount !== null && (!Number.isFinite(maxLoanAmount) || maxLoanAmount < minLoanAmount)) {
            alert("Maximum loan amount must be greater than or equal to the minimum.");
            return;
        }

        member.id = id;
        member.name = name;
        member.team = team;
        member.bankName = bankName;
        member.branch = branch;
        member.floor = floor;
        member.role = role;
        member.agentLocations = agentLocations;
        member.minLoanAmount = minLoanAmount;
        member.maxLoanAmount = maxLoanAmount;
        member.isCustom = true;
        if (id !== originalId && !member.password) {
            member.password = DEMO_DEFAULT_PASSWORDS[originalId] || "";
        }
        if (password) member.password = password;

        if (id !== originalId) {
            // Carry the new login ID through every place a customer references this person,
            // otherwise renamed TLs / bank users lose their queues and history links.
            const referenceFields = [
                "agentId", "forwardedToTL", "reviewedBy", "tlReturnBy",
                "bankForwardedBy", "bankStatusUpdatedBy"
            ];
            customers.forEach(customer => {
                referenceFields.forEach(field => {
                    if (customer[field] === originalId) customer[field] = id;
                });
            });
        }

        const savePromise = saveAgents();
        try {
            if (savePromise) await savePromise;
        } catch (error) {
            alert(`Could not save team-member changes: ${error.message}`);
            return;
        }
        cancelEditTeamMember();
        renderAgents();
        renderBranchManagement();
        updateDashboard();
        alert("Team-member information updated successfully.");
    });

function editTeamMember(id) {
    if (!currentUser || currentUser.role !== "backend") {
        alert("Only backend administrators can edit team-member information.");
        return;
    }

    const member = users.find(user => user.id === id);
    if (!member || !["agent", "tl", "manager", "bank_backend", "higher_management"].includes(member.role)) return;

    updateMemberBranchOptions();
    document.getElementById("editAgentOriginalId").value = member.id;
    document.getElementById("editAgentId").value = member.id;
    document.getElementById("editAgentName").value = member.name;
    document.getElementById("editAgentPassword").value = "";
    document.getElementById("editAgentTeam").value = member.team || "";
    document.getElementById("editAgentBranch").value = member.branch || "";
    document.getElementById("editAgentBank").value = member.bankName || "";
    document.getElementById("editAgentFloor").value = member.floor || "";
    document.getElementById("editAgentLocations").value = (member.agentLocations || []).join(", ");
    document.getElementById("editAgentMinLoan").value = member.minLoanAmount ?? 0;
    document.getElementById("editAgentMaxLoan").value = member.maxLoanAmount ?? "";
    document.getElementById("editAgentRole").value = member.role;
    updateMemberRoleFields();
    document.getElementById("editAgentPanel").classList.remove("hidden");
    document.getElementById("editAgentPanel").scrollIntoView({ behavior: "smooth", block: "center" });
}

function cancelEditTeamMember() {
    document.getElementById("editAgentForm").reset();
    document.getElementById("editAgentPanel").classList.add("hidden");
}

function updateMemberBranchOptions() {
    ["newAgentBranch", "editAgentBranch"].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const previousValue = select.value;
        select.replaceChildren(new Option("No branch", ""));
        [...portalBranches]
            .sort((a, b) => a.localeCompare(b))
            .forEach(branch => select.add(new Option(branch, branch)));
        select.value = portalBranches.find(branch =>
            branch.toLowerCase() === previousValue.toLowerCase()
        ) || "";
    });
}

function renderBranchManagement() {
    const panel = document.getElementById("branchManagementPanel");
    const list = document.getElementById("branchList");
    if (!panel || !list) return;
    updateMemberBranchOptions();
    const canManage = currentUser?.role === "backend";
    panel.classList.toggle("hidden", !canManage);
    if (!canManage) return;

    list.innerHTML = portalBranches.length
        ? [...portalBranches].sort((a, b) => a.localeCompare(b)).map(branch => {
            const assignedMembers = users.filter(user =>
                user.role !== "backend" &&
                String(user.branch || "").trim().toLowerCase() === branch.toLowerCase()
            ).length;
            const assignedCustomers = customers.filter(customer =>
                getCustomerBranch(customer).toLowerCase() === branch.toLowerCase()
            ).length;
            return `
                <div class="branch-list-item">
                    <strong>${escapeHTML(branch)}</strong>
                    <span>${assignedMembers} member(s) · ${assignedCustomers} customer application(s) (assignments clear on removal)</span>
                    <button type="button" class="remove-agent-btn" data-remove-branch="${escapeHTML(branch)}">Remove</button>
                </div>
            `;
        }).join("")
        : '<p class="history-empty">No branches yet. Add a branch to assign it to members.</p>';

    list.querySelectorAll("[data-remove-branch]").forEach(button => {
        button.addEventListener("click", () => removeBranch(button.dataset.removeBranch));
    });
}

async function saveBranchList(branches) {
    if (!Array.isArray(branches) || branches.some(branch => !String(branch).trim())) {
        throw new Error("Branch names cannot be empty.");
    }
    portalBranches = [...new Set(branches.map(branch => String(branch).trim()))]
        .sort((first, second) => first.localeCompare(second));
}

document.getElementById("branchForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentUser?.role !== "backend") {
        alert("Only the main backend administrator can manage branches.");
        return;
    }
    const input = document.getElementById("newBranchName");
    const branch = input.value.trim();
    if (!branch) return;
    if (portalBranches.some(existing => existing.toLowerCase() === branch.toLowerCase())) {
        alert("That branch already exists.");
        return;
    }

    const previousBranches = [...portalBranches];
    portalBranches = [...portalBranches, branch].sort((a, b) => a.localeCompare(b));
    renderBranchManagement();
    input.value = "";
    try {
        await saveBranchList(portalBranches);
        renderBranchManagement();
        updateMemberBranchOptions();
        renderAgents();
        renderAssignments();
        renderPerformanceLoanAmounts();
    } catch (error) {
        portalBranches = previousBranches;
        renderBranchManagement();
        alert(`Could not add branch: ${error.message}`);
    }
});

async function removeBranch(branch) {
    if (currentUser?.role !== "backend") {
        alert("Only the main backend administrator can manage branches.");
        return;
    }
    const assignedMemberCount = users.filter(user =>
        user.role !== "backend" &&
        String(user.branch || "").trim().toLowerCase() === branch.toLowerCase()
    ).length;
    const assignedCustomerCount = customers.filter(customer =>
        getCustomerBranch(customer).toLowerCase() === branch.toLowerCase()
    ).length;
    const assignmentWarning = assignedMemberCount || assignedCustomerCount
        ? ` This will clear the branch assignment from ${assignedMemberCount} member(s) and ${assignedCustomerCount} customer application(s).`
        : "";
    if (!confirm(`Remove the ${branch} branch?${assignmentWarning}`)) return;

    const previousUsers = users;
    const previousCustomers = customers;
    const previousBranches = [...portalBranches];
    const normalizedBranch = branch.toLowerCase();
    users = users.map(user =>
        user.role !== "backend" &&
        String(user.branch || "").trim().toLowerCase() === normalizedBranch
            ? { ...user, branch: "" }
            : user
    );
    customers = customers.map(customer =>
        String(customer.branch || "").trim().toLowerCase() === normalizedBranch
            ? { ...customer, branch: "" }
            : customer
    );
    portalBranches = portalBranches.filter(existing => existing.toLowerCase() !== branch.toLowerCase());
    renderBranchManagement();
    try {
        await saveBranchList(portalBranches);
        renderBranchManagement();
        updateMemberBranchOptions();
        renderAgents();
        renderAssignments();
        updateDashboard();
        renderPerformanceLoanAmounts();
    } catch (error) {
        users = previousUsers;
        customers = previousCustomers;
        portalBranches = previousBranches;
        renderBranchManagement();
        alert(`Could not remove branch: ${error.message}`);
    }
}

function renderAssignerAccounts() {
    const body = document.getElementById("assignerAccountTableBody");
    if (!body || currentUser?.role !== "backend") return;

    const assigners = users
        .map((user, index) => ({ user, index }))
        .filter(item => item.user.role === "assigner");

    body.innerHTML = assigners.length
        ? assigners.map(({ user, index }) => `
            <tr>
                <td><input id="assignerId${index}" value="${escapeHTML(user.id)}" aria-label="Assigner login ID"></td>
                <td><input id="assignerName${index}" value="${escapeHTML(user.name)}" aria-label="Assigner name"></td>
                <td>
                    <select id="assignerBranch${index}" aria-label="Assigner branch">
                        <option value="">No branch</option>
                        ${[...portalBranches].sort((a, b) => a.localeCompare(b)).map(branch => `
                            <option value="${escapeHTML(branch)}" ${branch.toLowerCase() === String(user.branch || "").trim().toLowerCase() ? "selected" : ""}>${escapeHTML(branch)}</option>
                        `).join("")}
                    </select>
                </td>
                <td><input id="assignerPassword${index}" type="password" placeholder="Leave blank to keep current" aria-label="New assigner password"></td>
                <td>
                    <button type="button" class="action-btn" onclick="saveAssignerAccount(${index})">Save</button>
                    <button type="button" class="delete-customer-btn" onclick="removeAssignerAccount(${index})">Remove</button>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="5" style="text-align:center;padding:24px">No assigner accounts.</td></tr>';
}

function saveAssignerAccount(index) {
    if (currentUser?.role !== "backend") {
        alert("Only the backend administrator can manage assigners.");
        return;
    }

    const target = users[index];
    if (!target || target.role !== "assigner") return;

    const newId = document.getElementById(`assignerId${index}`).value.trim();
    const newName = document.getElementById(`assignerName${index}`).value.trim();
    const newBranch = document.getElementById(`assignerBranch${index}`).value.trim();
    const newPassword = document.getElementById(`assignerPassword${index}`).value;
    if (!newId || !newName) {
        alert("Login ID and name are required.");
        return;
    }
    if (newBranch && !portalBranches.some(branch => branch.toLowerCase() === newBranch.toLowerCase())) {
        alert("Select a branch configured by the backend administrator.");
        return;
    }
    if (users.some((user, userIndex) =>
        userIndex !== index && user.id.toLowerCase() === newId.toLowerCase()
    )) {
        alert("That Login ID is already in use.");
        return;
    }

    target.id = newId;
    target.name = newName;
    target.branch = newBranch;
    target.isCustom = true;
    if (newPassword) target.password = newPassword;
    saveAgents();
    renderAgents();
    alert("Assigner account saved.");
}

function removeAssignerAccount(index) {
    if (currentUser?.role !== "backend") {
        alert("Only the backend administrator can remove assigners.");
        return;
    }

    const target = users[index];
    if (!target || target.role !== "assigner") return;
    if (!confirm(`Remove assigner account ${target.id}? This cannot be undone.`)) return;

    users.splice(index, 1);
    saveAgents();
    renderAgents();
}

function renderAgents() {
    const body = document.getElementById("agentTableBody");
    renderAssignerAccounts();
    const members = users.filter(user => user.role === currentManagementPage &&
        ["agent", "tl", "manager", "bank_backend", "higher_management"].includes(user.role) &&
        // A manager only manages agents of their own branch.
        (currentUser?.role !== "manager" || teamsMatch(user.branch, currentUser.branch)));
    const showAutoAssignCriteria = currentManagementPage === "agent";
    document.getElementById("autoAssignCriteriaHeader")
        ?.classList.toggle("hidden", !showAutoAssignCriteria);

    if (!members.length) {
        body.innerHTML = `
            <tr>
                <td colspan="${showAutoAssignCriteria ? 10 : 9}" style="text-align:center;padding:40px;">
                    No team members found. Add someone using the form above.
                </td>
            </tr>
        `;
        return;
    }

    body.innerHTML = members.map(member => {
        const teamAgentCount = member.role === "tl" && member.team
            ? users.filter(user =>
                user.role === "agent" &&
                String(user.team || "").trim().toLowerCase() === String(member.team).trim().toLowerCase()
            ).length
            : null;
        const assignedCount = member.role === "bank_backend"
            ? customers.filter(customer =>
                customer.approvalStatus === "approved" &&
                normalizeBankName(customer.banksPushing) === normalizeBankName(member.bankName)
            ).length
            : customers.filter(customer => customer.agentId === member.id).length;
        const roleLabel = member.role === "tl"
            ? "Team Leader (TL)"
            : member.role === "bank_backend"
                ? "Bank Backend"
                : member.role === "higher_management"
                    ? "Higher Management"
                    : member.role.charAt(0).toUpperCase() + member.role.slice(1);
        const locationLabels = Array.isArray(member.agentLocations) ? member.agentLocations.join(", ") : "";
        const minLoan = formatMoney(member.minLoanAmount || 0);
        const maxLoan = member.maxLoanAmount === null || member.maxLoanAmount === undefined || member.maxLoanAmount === ""
            ? "No maximum"
            : formatMoney(member.maxLoanAmount);
        const assignmentCriteria = member.role === "agent" && locationLabels
            ? `${escapeHTML(locationLabels)} · ${minLoan}–${maxLoan}`
            : "—";
        return `
            <tr>
                <td><strong>${escapeHTML(member.name)}</strong></td>
                <td>${escapeHTML(member.id)}</td>
                <td>${escapeHTML(member.role === "bank_backend" ? member.bankName || "—" : member.team || "—")}</td>
                <td>${teamAgentCount ?? "—"}</td>
                <td>${escapeHTML(member.branch || "—")}</td>
                <td>${escapeHTML(member.floor || "—")}</td>
                <td>${escapeHTML(roleLabel)}</td>
                ${showAutoAssignCriteria ? `<td>${assignmentCriteria}</td>` : ""}
                <td>${member.role === "higher_management" ? "—" : assignedCount}</td>
                <td>
                    ${currentUser.role === "backend" ? `
                        <button class="action-btn" onclick="editTeamMember('${escapeHTML(member.id)}')">
                            Edit
                        </button>
                    ` : ""}
                    ${member.role === "agent" || currentUser.role === "backend" ? `
                        <button class="remove-agent-btn" onclick="removeTeamMember('${escapeHTML(member.id)}')">
                            Remove
                        </button>
                    ` : "—"}
                </td>
            </tr>
        `;
    }).join("");
}

function removeTeamMember(id) {
    if (!currentUser || (currentUser.role !== "manager" && currentUser.role !== "backend")) {
        alert("Only managers or backend administrators can remove team members.");
        return;
    }

    const member = users.find(user => user.id === id);
    const canRemove = member && member.role !== "backend" && (
        currentUser.role === "backend" ||
        (member.role === "agent" && teamsMatch(member.branch, currentUser.branch))
    );
    if (!canRemove) {
        alert("Managers can only remove agents.");
        return;
    }

    const isAgent = member.role === "agent";
    const isTL = member.role === "tl";
    const roleName = isTL ? "Team Leader"
        : member.role === "bank_backend" ? "Bank Backend"
        : member.role === "higher_management" ? "Higher Management"
        : member.role === "assigner" ? "Assigner"
        : isAgent ? "agent" : "Manager";
    const message = isAgent || isTL
        ? `Remove ${roleName} ${member.name}? Customers assigned to them will become unassigned.`
        : `Remove ${roleName} ${member.name}?`;
    if (!confirm(message)) return;

    users = users.filter(user => user.id !== id);
    // Never leave customers pointing at an account that no longer exists.
    customers.forEach(customer => {
        if (customer.agentId === id) customer.agentId = "";
    });
    if (isTL) {
        const replacementTL = users.find(user =>
            user.role === "tl" && user.id !== id && teamsMatch(user.team, member.team)
        );
        customers.forEach(customer => {
            if (customer.forwardedToTL !== id || customer.approvalStatus !== "pending") return;
            if (replacementTL) {
                customer.forwardedToTL = replacementTL.id;
                recordCustomerActivity(customer, "forwarded",
                    `Approval moved to ${replacementTL.name} (${replacementTL.id}) because ${member.name} was removed`);
            } else {
                customer.approvalStatus = "returned";
                customer.tlReturnComment = "Your team leader was removed. Forward this application again once a new team leader is assigned.";
                customer.tlReturnAt = new Date().toISOString();
                customer.reviewedAt = customer.tlReturnAt;
                recordCustomerActivity(customer, "approval",
                    `Application returned because team leader ${member.name} was removed`);
            }
        });
    }
    saveData();

    saveAgents();
    renderAgents();
    renderBranchManagement();
    updateDashboard();
}

function saveAgents() {
    return Promise.resolve();
}


/* ================= LOGOUT ================= */

async function logout() {

    closeAccountMenu();
    closeChangePassword();
    if (callbackNotificationTimer) {
        clearInterval(callbackNotificationTimer);
        callbackNotificationTimer = null;
    }
    currentUser = null;
    resetPortalViewState();
    document.getElementById("customerModal")?.classList.add("hidden");
    document.getElementById("agentReturnNotifications")?.replaceChildren();


    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("loginId")
        .value = "";

    document
        .getElementById("password")
        .value = "";

}


/* ================= PASSWORD ================= */

function togglePassword() {

    const password =
        document.getElementById(
            "password"
        );


    password.type =
        password.type === "password"
            ? "text"
            : "password";

}


/* ================= DEMO LOGIN ================= */

function fillLogin(id, password) {

    document.getElementById(
        "loginId"
    ).value = id;


    document.getElementById(
        "password"
    ).value = password;

}


/* ================= HELPERS ================= */

function formatMoney(number) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number || 0);

}

function normalizeCustomerStatus(status) {
    const value = String(status ?? "").trim();
    const normalized = value.toLowerCase().replace(/[ _-]+/g, " ");

    const statusMap = {
        "not called": "Not Called",
        "notcalled": "Not Called",
        pending: "Pending",
        eligible: "Eligible",
        review: "Review",
        "call back": "Call Back",
        callback: "Call Back",
        "not responded": "Not responded",
        "not responding": "Not responded",
        "not interested": "Not Interested",
        "not eligible": "Not Eligible",
        noteligible: "Not Eligible",
        lead: "Lead",
        appeoved: "Approved",
        aproved: "Approved",
        new: "TL Approved",
        "sent to bank": "TL Approved",
        "tl approved": "TL Approved",
        "logged in": "Logged In",
        underwriting: "Underwriting",
        "in process": "Underwriting",
        "documents pending": "Documents Pending",
        approved: "Approved",
        rejected: "Rejected",
        disbursed: "Disbursed"
    };

    return statusMap[normalized] || value || "Pending";
}


function getInitials(name) {

    return name
        .split(" ")
        .map(
            word =>
                word.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================= IN-MEMORY STATE ================= */

const STORAGE_KEY = "loanPortalState_v1";

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (saved && Array.isArray(saved.customers)) customers = saved.customers;
    } catch (error) {
        console.error("Could not load saved data:", error);
    }
}

async function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers }));
    } catch (error) {
        console.error("Could not save data:", error);
    }
}

loadData();

// Another tab saved a change (e.g. TL approved) -> refresh whatever this user is looking at.
window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY || !currentUser) return;
    loadData();
    renderBankApplications();
    renderTLBankApplications();
    renderCustomers();
    updateDashboard();
});

const toggle = document.getElementById("calculatorToggle");
const popup = document.getElementById("calculatorPopup");
const close = document.getElementById("calculatorClose");
const calculatorSalary = document.getElementById("calculatorSalary");
const calculatorEmi = document.getElementById("calculatorEmi");

function calculateEligibleLoan() {
    const salary = Math.max(0, Number(calculatorSalary.value) || 0);
    const emi = Math.max(0, Number(calculatorEmi.value) || 0);
    let salaryFactor = 0;

    if (salary >= 20000 && salary <= 49999) salaryFactor = 0.55;
    else if (salary >= 50000 && salary <= 99999) salaryFactor = 0.65;
    else if (salary >= 100000) salaryFactor = 0.75;

    // Formula result is in lakhs; round down to one decimal place like ROUNDDOWN(..., 1).
    const eligibleLakhs = salaryFactor
        ? Math.trunc(((salary * salaryFactor - emi) / 2500) * 10) / 10
        : 0;

    document.getElementById("calculatorEligibleAmount").textContent =
        formatMoney(eligibleLakhs * 100000);
    document.getElementById("calculatorEligibleLakh").textContent =
        `${eligibleLakhs.toFixed(1)} lakh`;
}

toggle.addEventListener("click", () => {
    popup.hidden = !popup.hidden;
});

close.addEventListener("click", () => {
    popup.hidden = true;
});

calculatorSalary.addEventListener("input", calculateEligibleLoan);
calculatorEmi.addEventListener("input", calculateEligibleLoan);
calculateEligibleLoan();
