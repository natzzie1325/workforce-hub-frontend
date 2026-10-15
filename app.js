// WorkforceHub Pro - Frontend Application Engine

// Global State
let API_BASE_URL = localStorage.getItem('WORKFORCE_API_URL') || 'http://localhost:8080/api/employees';
let isDemoMode = localStorage.getItem('WORKFORCE_DEMO_MODE') === 'true';
let employees = [];
let filteredEmployees = [];
let viewMode = 'table';
let deptChartInstance = null;
let statusChartInstance = null;

// Built-in resilient fallback mock data (Ensures live deployment links ALWAYS display rich content)
const DEFAULT_FALLBACK_DATA = [
    {
        id: 1,
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.jenkins@workforce.io",
        department: "Engineering",
        position: "Principal Cloud Architect",
        salary: 135000,
        status: "ACTIVE",
        performanceRating: 4.9,
        joinDate: "2022-03-15",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 2,
        firstName: "Marcus",
        lastName: "Chen",
        email: "marcus.chen@workforce.io",
        department: "Engineering",
        position: "Senior Full-Stack Engineer",
        salary: 115000,
        status: "ACTIVE",
        performanceRating: 4.8,
        joinDate: "2022-07-01",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 3,
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena.rostova@workforce.io",
        department: "Design",
        position: "Lead UI/UX Designer",
        salary: 98000,
        status: "REMOTE",
        performanceRating: 4.7,
        joinDate: "2023-01-10",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 4,
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@workforce.io",
        department: "Marketing",
        position: "Growth Marketing Director",
        salary: 108000,
        status: "ACTIVE",
        performanceRating: 4.5,
        joinDate: "2021-11-20",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 5,
        firstName: "Amara",
        lastName: "Okonkwo",
        email: "amara.okonkwo@workforce.io",
        department: "Human Resources",
        position: "People Operations Manager",
        salary: 88000,
        status: "ACTIVE",
        performanceRating: 4.6,
        joinDate: "2023-04-05",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 6,
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@workforce.io",
        department: "Finance",
        position: "Senior Financial Analyst",
        salary: 95000,
        status: "ON_LEAVE",
        performanceRating: 4.3,
        joinDate: "2022-09-12",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 7,
        firstName: "Sophia",
        lastName: "Martinez",
        email: "sophia.martinez@workforce.io",
        department: "Sales",
        position: "Enterprise Account Executive",
        salary: 102000,
        status: "ACTIVE",
        performanceRating: 4.8,
        joinDate: "2023-08-18",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        id: 8,
        firstName: "Liam",
        lastName: "Patel",
        email: "liam.patel@workforce.io",
        department: "Engineering",
        position: "DevOps & SRE Specialist",
        salary: 112000,
        status: "REMOTE",
        performanceRating: 4.6,
        joinDate: "2023-02-28",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80"
    }
];

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    updateApiSettingsModalFields();
    await fetchEmployees();
}

// Fetch all employees from Spring Boot REST API
async function fetchEmployees() {
    updateConnectionStatus('connecting', 'Connecting...');

    if (isDemoMode) {
        useFallbackData('Demo / Fallback Mode active');
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(API_BASE_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to reach API`);
        }

        const data = await response.json();
        employees = Array.isArray(data) && data.length > 0 ? data : DEFAULT_FALLBACK_DATA;
        filteredEmployees = [...employees];

        updateConnectionStatus('connected', 'Live Spring Boot API Connected');
        renderAll();
    } catch (err) {
        console.warn('API Connection fallback:', err.message);
        useFallbackData('API Offline (Showing Resilient Cache)');
    }
}

function useFallbackData(statusMsg) {
    if (!employees || employees.length === 0) {
        employees = JSON.parse(localStorage.getItem('WORKFORCE_LOCAL_CACHE')) || DEFAULT_FALLBACK_DATA;
    }
    filteredEmployees = [...employees];
    updateConnectionStatus('offline', statusMsg);
    renderAll();
}

function updateConnectionStatus(state, text) {
    const dot = document.getElementById('backendStatusDot');
    const label = document.getElementById('backendStatusText');

    if (!dot || !label) return;

    label.textContent = text;
    dot.className = 'w-2.5 h-2.5 rounded-full';

    if (state === 'connected') {
        dot.classList.add('bg-emerald-500');
    } else if (state === 'connecting') {
        dot.classList.add('bg-amber-400', 'animate-pulse');
    } else {
        dot.classList.add('bg-indigo-500');
    }
}

// Render UI Components
function renderAll() {
    renderKPIs();
    renderDirectory();
    renderCharts();
    renderAnalyticsTable();
}

// Render Metric Cards
function renderKPIs() {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'ACTIVE').length;
    const avgSalary = total > 0 ? Math.round(employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0) / total) : 0;
    const avgRating = total > 0 ? (employees.reduce((acc, e) => acc + (Number(e.performanceRating) || 0), 0) / total).toFixed(1) : '0.0';
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statActivePct').textContent = activePct;
    document.getElementById('statAvgSalary').textContent = '$' + avgSalary.toLocaleString();
    document.getElementById('statRating').textContent = avgRating;
}

// Render Directory (Table & Grid)
function renderDirectory() {
    const tbody = document.getElementById('employeeTableBody');
    const gridContainer = document.getElementById('gridContainer');
    const emptyState = document.getElementById('emptyState');

    if (!tbody || !gridContainer) return;

    if (filteredEmployees.length === 0) {
        tbody.innerHTML = '';
        gridContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Render Table rows
    tbody.innerHTML = filteredEmployees.map(emp => `
        <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3.5 px-4">
                <div class="flex items-center space-x-3">
                    <img src="${emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}" alt="${emp.firstName}" class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=6366f1&color=fff'">
                    <div>
                        <div class="font-semibold text-slate-900">${emp.firstName} ${emp.lastName}</div>
                        <div class="text-xs text-slate-500">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800">${emp.position}</div>
                <span class="inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md mt-0.5">${emp.department}</span>
            </td>
            <td class="py-3.5 px-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(emp.status)}">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(emp.status)}"></span>
                    ${emp.status}
                </span>
            </td>
            <td class="py-3.5 px-4 font-mono font-medium text-slate-700">
                $${Number(emp.salary || 0).toLocaleString()}
            </td>
            <td class="py-3.5 px-4">
                <div class="flex items-center text-amber-500 font-semibold text-xs">
                    <i class="fa-solid fa-star mr-1"></i>
                    <span>${Number(emp.performanceRating || 4.5).toFixed(1)}</span>
                </div>
            </td>
            <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="editEmployee(${emp.id})" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Employee">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteEmployee(${emp.id})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Employee">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render Grid cards
    gridContainer.innerHTML = filteredEmployees.map(emp => `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
            <div>
                <div class="flex items-start justify-between">
                    <img src="${emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}" class="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=6366f1&color=fff'">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClass(emp.status)}">
                        ${emp.status}
                    </span>
                </div>
                <h4 class="text-base font-bold text-slate-900 mt-3">${emp.firstName} ${emp.lastName}</h4>
                <p class="text-xs text-indigo-600 font-medium">${emp.position}</p>
                <p class="text-xs text-slate-400 mt-0.5">${emp.email}</p>

                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase">Department</span>
                        <span class="font-semibold text-slate-700">${emp.department}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-slate-400 block text-[10px] uppercase">Salary</span>
                        <span class="font-mono font-semibold text-slate-800">$${Number(emp.salary || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div class="text-amber-500 font-semibold text-xs flex items-center">
                    <i class="fa-solid fa-star mr-1"></i>${Number(emp.performanceRating || 4.5).toFixed(1)}
                </div>
                <div class="flex items-center space-x-1">
                    <button onclick="editEmployee(${emp.id})" class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors">
                        Edit
                    </button>
                    <button onclick="deleteEmployee(${emp.id})" class="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'ACTIVE': return 'badge-active';
        case 'REMOTE': return 'badge-remote';
        case 'ON_LEAVE': return 'badge-on_leave';
        default: return 'bg-slate-100 text-slate-700';
    }
}

function getStatusDotClass(status) {
    switch (status) {
        case 'ACTIVE': return 'bg-emerald-500';
        case 'REMOTE': return 'bg-blue-500';
        case 'ON_LEAVE': return 'bg-amber-500';
        default: return 'bg-slate-400';
    }
}

// Render Interactive Visual Charts with Chart.js
function renderCharts() {
    if (typeof Chart === 'undefined') return;

    // Headcount by Department
    const deptCounts = {};
    employees.forEach(e => {
        deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });

    const deptLabels = Object.keys(deptCounts);
    const deptValues = Object.values(deptCounts);

    const deptCanvas = document.getElementById('deptChart');
    if (deptCanvas) {
        if (deptChartInstance) deptChartInstance.destroy();
        deptChartInstance = new Chart(deptCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: deptLabels,
                datasets: [{
                    data: deptValues,
                    backgroundColor: [
                        '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // Status breakdown chart
    const statusCounts = {};
    employees.forEach(e => {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });

    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);

    const statusCanvas = document.getElementById('statusChart');
    if (statusCanvas) {
        if (statusChartInstance) statusChartInstance.destroy();
        statusChartInstance = new Chart(statusCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: statusLabels,
                datasets: [{
                    label: 'Employees',
                    data: statusValues,
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// Render Detailed Analytics Breakdown
function renderAnalyticsTable() {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;

    const deptStats = {};
    employees.forEach(e => {
        if (!deptStats[e.department]) {
            deptStats[e.department] = { count: 0, totalSalary: 0, totalRating: 0 };
        }
        deptStats[e.department].count++;
        deptStats[e.department].totalSalary += (Number(e.salary) || 0);
        deptStats[e.department].totalRating += (Number(e.performanceRating) || 4.0);
    });

    const totalStaff = employees.length || 1;

    tbody.innerHTML = Object.entries(deptStats).map(([dept, data]) => {
        const avgSal = Math.round(data.totalSalary / data.count);
        const avgRat = (data.totalRating / data.count).toFixed(1);
        const pct = Math.round((data.count / totalStaff) * 100);

        return `
            <tr class="hover:bg-slate-50">
                <td class="py-3 px-4 font-semibold text-slate-800">${dept}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                        ${data.count} staff (${pct}%)
                    </span>
                </td>
                <td class="py-3 px-4 font-mono text-slate-700">$${avgSal.toLocaleString()}</td>
                <td class="py-3 px-4">
                    <span class="text-amber-500 font-semibold text-xs"><i class="fa-solid fa-star mr-1"></i>${avgRat} / 5.0</span>
                </td>
                <td class="py-3 px-4 font-mono text-slate-600">$${data.totalSalary.toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

// Tab Switching
function switchTab(tabName) {
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('directoryView').classList.add('hidden');
    document.getElementById('analyticsView').classList.add('hidden');

    ['Dashboard', 'Directory', 'Analytics'].forEach(t => {
        const btn = document.getElementById(`navTab${t}`);
        if (btn) {
            btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900';
        }
    });

    const activeBtn = document.getElementById(`navTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activeBtn) {
        activeBtn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-indigo-600 bg-white shadow-sm';
    }

    if (tabName === 'dashboard') {
        document.getElementById('dashboardView').classList.remove('hidden');
        renderCharts();
    } else if (tabName === 'directory') {
        document.getElementById('directoryView').classList.remove('hidden');
    } else if (tabName === 'analytics') {
        document.getElementById('analyticsView').classList.remove('hidden');
        renderAnalyticsTable();
    }
}

// Search & Filter Handlers
function handleSearch(term) {
    const q = term.toLowerCase().trim();
    applyFilters(q);
}

function handleFilterChange() {
    const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    applyFilters(q);
}

function applyFilters(searchQuery = '') {
    const dept = document.getElementById('departmentFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredEmployees = employees.filter(e => {
        const matchesQuery = !searchQuery ||
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery) ||
            e.email.toLowerCase().includes(searchQuery) ||
            e.position.toLowerCase().includes(searchQuery) ||
            e.department.toLowerCase().includes(searchQuery);

        const matchesDept = (dept === 'ALL') || (e.department.toLowerCase() === dept.toLowerCase());
        const matchesStatus = (status === 'ALL') || (e.status.toLowerCase() === status.toLowerCase());

        return matchesQuery && matchesDept && matchesStatus;
    });

    renderDirectory();
}

function setViewMode(mode) {
    viewMode = mode;
    const tableBtn = document.getElementById('viewModeTable');
    const gridBtn = document.getElementById('viewModeGrid');
    const tableContainer = document.getElementById('tableContainer');
    const gridContainer = document.getElementById('gridContainer');

    if (mode === 'table') {
        tableBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-600 shadow-sm';
        gridBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800';
        tableContainer.classList.remove('hidden');
        gridContainer.classList.add('hidden');
    } else {
        gridBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-600 shadow-sm';
        tableBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800';
        tableContainer.classList.add('hidden');
        gridContainer.classList.remove('hidden');
    }
}

// Modal Handlers (Add / Edit)
function openEmployeeModal(emp = null) {
    const modal = document.getElementById('employeeModal');
    const title = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveButton');

    if (emp) {
        title.textContent = 'Edit Employee Record';
        saveBtn.textContent = 'Update Employee';
        document.getElementById('employeeId').value = emp.id;
        document.getElementById('formFirstName').value = emp.firstName;
        document.getElementById('formLastName').value = emp.lastName;
        document.getElementById('formEmail').value = emp.email;
        document.getElementById('formDepartment').value = emp.department;
        document.getElementById('formPosition').value = emp.position;
        document.getElementById('formSalary').value = emp.salary;
        document.getElementById('formStatus').value = emp.status;
        document.getElementById('formRating').value = emp.performanceRating || 4.5;
        document.getElementById('formAvatar').value = emp.avatarUrl || '';
    } else {
        title.textContent = 'Add New Employee';
        saveBtn.textContent = 'Create Employee';
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').value = '';
        document.getElementById('formRating').value = '4.5';
    }

    modal.classList.remove('hidden');
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.add('hidden');
}

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (emp) openEmployeeModal(emp);
}

// Form Submit: POST (Create) or PUT (Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('employeeId').value;
    const isEdit = Boolean(id);

    const payload = {
        firstName: document.getElementById('formFirstName').value.trim(),
        lastName: document.getElementById('formLastName').value.trim(),
        email: document.getElementById('formEmail').value.trim(),
        department: document.getElementById('formDepartment').value,
        position: document.getElementById('formPosition').value.trim(),
        salary: parseFloat(document.getElementById('formSalary').value),
        status: document.getElementById('formStatus').value,
        performanceRating: parseFloat(document.getElementById('formRating').value),
        avatarUrl: document.getElementById('formAvatar').value.trim() || undefined
    };

    try {
        if (!isDemoMode) {
            const url = isEdit ? `${API_BASE_URL}/${id}` : API_BASE_URL;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('API server returned error: ' + response.status);
            }
        }

        // Update local state
        if (isEdit) {
            const index = employees.findIndex(e => String(e.id) === String(id));
            if (index !== -1) {
                employees[index] = { ...employees[index], ...payload };
            }
            showToast('Employee updated successfully!', 'success');
        } else {
            const newEmployee = {
                id: Date.now(),
                ...payload,
                joinDate: new Date().toISOString().split('T')[0]
            };
            employees.unshift(newEmployee);
            showToast('Employee created successfully!', 'success');
        }

        localStorage.setItem('WORKFORCE_LOCAL_CACHE', JSON.stringify(employees));
        closeEmployeeModal();
        handleFilterChange();
        renderAll();
    } catch (err) {
        showToast('Error saving: ' + err.message, 'error');
    }
}

// Delete Employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
        if (!isDemoMode) {
            await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        }

        employees = employees.filter(e => String(e.id) !== String(id));
        localStorage.setItem('WORKFORCE_LOCAL_CACHE', JSON.stringify(employees));
        showToast('Employee deleted successfully', 'info');
        handleFilterChange();
        renderAll();
    } catch (err) {
        showToast('Delete failed: ' + err.message, 'error');
    }
}

// CSV Export
function exportDataCSV() {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Position', 'Salary', 'Status', 'Rating'];
    const rows = employees.map(e => [
        e.id,
        `"${e.firstName}"`,
        `"${e.lastName}"`,
        `"${e.email}"`,
        `"${e.department}"`,
        `"${e.position}"`,
        e.salary,
        e.status,
        e.performanceRating
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV dataset', 'success');
}

// API Config Modal Handlers
function openApiConfigModal() {
    updateApiSettingsModalFields();
    document.getElementById('apiConfigModal').classList.remove('hidden');
}

function closeApiConfigModal() {
    document.getElementById('apiConfigModal').classList.add('hidden');
}

function updateApiSettingsModalFields() {
    const input = document.getElementById('apiEndpointInput');
    const toggle = document.getElementById('demoModeToggle');
    if (input) input.value = API_BASE_URL;
    if (toggle) toggle.checked = isDemoMode;
}

function toggleDemoMode(checked) {
    isDemoMode = checked;
    localStorage.setItem('WORKFORCE_DEMO_MODE', String(checked));
}

function saveApiConfig() {
    const input = document.getElementById('apiEndpointInput');
    if (input && input.value.trim()) {
        API_BASE_URL = input.value.trim();
        localStorage.setItem('WORKFORCE_API_URL', API_BASE_URL);
    }
    closeApiConfigModal();
    showToast('API Configuration saved. Reconnecting...', 'info');
    fetchEmployees();
}

async function testApiConnection() {
    const testUrl = document.getElementById('apiEndpointInput').value.trim();
    showToast('Testing connectivity...', 'info');

    try {
        const res = await fetch(testUrl, { method: 'GET' });
        if (res.ok) {
            showToast('Connection SUCCESSFUL! REST API is responding.', 'success');
        } else {
            showToast(`Connection responded with HTTP ${res.status}`, 'error');
        }
    } catch (e) {
        showToast('Connection FAILED: Check that Spring Boot is running and CORS is enabled.', 'error');
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        info: 'bg-slate-900 text-white'
    };

    const icons = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    toast.className = `toast-animate flex items-center space-x-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium ${colors[type] || colors.info}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
