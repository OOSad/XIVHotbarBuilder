const jobs = [
    { name: 'Bard', abbr: 'BRD' },
    { name: 'Beastmaster', abbr: 'BST' },
    { name: 'Black Mage', abbr: 'BLM' },
    { name: 'Blue Mage', abbr: 'BLU' },
    { name: 'Corsair', abbr: 'COR' },
    { name: 'Dancer', abbr: 'DNC' },
    { name: 'Dark Knight', abbr: 'DRK' },
    { name: 'Dragoon', abbr: 'DRG' },
    { name: 'Geomancer', abbr: 'GEO' },
    { name: 'Monk', abbr: 'MNK' },
    { name: 'Ninja', abbr: 'NIN' },
    { name: 'Paladin', abbr: 'PLD' },
    { name: 'Puppetmaster', abbr: 'PUP' },
    { name: 'Ranger', abbr: 'RNG' },
    { name: 'Red Mage', abbr: 'RDM' },
    { name: 'Rune Fencer', abbr: 'RUN' },
    { name: 'Samurai', abbr: 'SAM' },
    { name: 'Scholar', abbr: 'SCH' },
    { name: 'Summoner', abbr: 'SMN' },
    { name: 'Thief', abbr: 'THF' },
    { name: 'Warrior', abbr: 'WAR' },
    { name: 'White Mage', abbr: 'WHM' }
];

// State
let hotbarState = {
    1: Array(12).fill(null),
    2: Array(12).fill(null),
    3: Array(12).fill(null),
    4: Array(12).fill(null)
};

// DOM Elements
const carouselTrack = document.getElementById('action-carousel');
const hotbarsContainer = document.getElementById('hotbars-container');
const searchInput = document.getElementById('action-search');
const jobSelect = document.getElementById('job-select');
const exportBtn = document.getElementById('export-button');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const helpBtn = document.getElementById('help-button');

// Modal Elements
const modalOverlay = document.getElementById('target-modal');
const modalTargetSelect = document.getElementById('modal-target-select');
const modalActionName = document.getElementById('modal-action-name');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');

// Help Modal
const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');

let pendingDrop = null;

// Initialize UI
function init() {
    renderCarousel(actions);
    populateJobs();
    loadState();
    renderHotbars();
    setupEventListeners();
}

function populateJobs() {
    jobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job.abbr;
        option.textContent = `${job.abbr} - ${job.name}`;
        jobSelect.appendChild(option);
    });
}

function renderCarousel(items) {
    carouselTrack.innerHTML = '';
    items.forEach(action => {
        const actionEl = createActionElement(action, false);
        carouselTrack.appendChild(actionEl);
    });
}

function createActionElement(action, isSlotContext = false) {
    const el = document.createElement('div');
    el.classList.add('action-item');
    el.draggable = true;
    el.dataset.id = action.id;
    el.dataset.name = action.name;
    el.dataset.type = action.type;

    const icon = document.createElement('div');
    icon.classList.add('action-icon');
    icon.style.backgroundColor = action.iconColor;
    
    // Add initials as placeholder icon graphic
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.color = '#333';
    icon.style.fontWeight = 'bold';
    icon.style.fontSize = '12px';
    icon.innerText = (action.displayName || action.name).substring(0,2);

    const name = document.createElement('div');
    name.classList.add('action-name');
    name.textContent = action.displayName || action.name;

    el.appendChild(icon);
    if (!isSlotContext) {
        el.appendChild(name);
    }

    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);

    // If it's in a slot, double click to remove
    if (isSlotContext) {
        el.addEventListener('dblclick', () => {
            const slot = el.parentElement;
            if(slot) {
                const hotbarId = slot.dataset.hotbar;
                const slotIndex = slot.dataset.slot;
                hotbarState[hotbarId][slotIndex] = null;
                slot.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'slot-id';
                span.textContent = parseInt(slotIndex) + 1;
                slot.appendChild(span);
                saveState();
            }
        });
    }

    return el;
}

function renderHotbars() {
    hotbarsContainer.innerHTML = '';
    for (let i = 4; i >= 1; i--) {
        const hotbar = document.createElement('div');
        hotbar.classList.add('hotbar');
        hotbar.dataset.id = i;

        for (let j = 0; j < 12; j++) {
            const slot = document.createElement('div');
            slot.classList.add('hotbar-slot');
            slot.dataset.hotbar = i;
            slot.dataset.slot = j;

            if (hotbarState[i][j]) {
                const actionElement = createActionElement(hotbarState[i][j], true);
                slot.appendChild(actionElement);
            } else {
                const span = document.createElement('span');
                span.className = 'slot-id';
                span.textContent = j + 1;
                slot.appendChild(span);
            }

            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('dragenter', handleDragEnter);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('drop', handleDrop);

            hotbar.appendChild(slot);
        }
        hotbarsContainer.appendChild(hotbar);
    }
}

// Drag and Drop Logic
let draggedElement = null;
let sourceSlot = null;

function handleDragStart(e) {
    draggedElement = e.currentTarget;
    sourceSlot = draggedElement.parentElement.classList.contains('hotbar-slot') ? draggedElement.parentElement : null;
    e.dataTransfer.effectAllowed = 'copyMove';
    // required for firefox
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.id);
    setTimeout(() => e.currentTarget.style.opacity = '0.5', 0);
}

function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    draggedElement = null;
    sourceSlot = null;
    document.querySelectorAll('.hotbar-slot').forEach(slot => slot.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const targetSlot = e.currentTarget;
    targetSlot.classList.remove('drag-over');

    const actionId = draggedElement.dataset.id;
    if (sourceSlot === targetSlot) return;

    if (sourceSlot) {
        // If moving an existing item, preserve its custom target and just move it
        const srcHotbar = sourceSlot.dataset.hotbar;
        const srcSlot = sourceSlot.dataset.slot;
        const action = hotbarState[srcHotbar][srcSlot];
        finalizeDrop(action, sourceSlot, targetSlot);
    } else {
        // If dragging from carousel, show modal to ask for target
        const baseAction = actions.find(a => a.id === actionId);
        if (baseAction) {
            pendingDrop = { baseAction, targetSlot };
            modalActionName.textContent = baseAction.displayName || baseAction.name;
            modalOverlay.classList.remove('hidden');
        }
    }
}

function finalizeDrop(action, sourceSlot, targetSlot) {
    const hotbarId = targetSlot.dataset.hotbar;
    const slotIndex = targetSlot.dataset.slot;

    // Update state
    hotbarState[hotbarId][slotIndex] = action;

    // Render new element in slot
    targetSlot.innerHTML = '';
    targetSlot.appendChild(createActionElement(action, true));

    // Clear source slot if moving within hotbars
    if (sourceSlot) {
        const srcHotbar = sourceSlot.dataset.hotbar;
        const srcSlot = sourceSlot.dataset.slot;
        hotbarState[srcHotbar][srcSlot] = null;
        sourceSlot.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'slot-id';
        span.textContent = parseInt(srcSlot) + 1;
        sourceSlot.appendChild(span);
    }
    
    saveState();
}

// Setup Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = actions.filter(a => (a.displayName || a.name).toLowerCase().includes(term));
        renderCarousel(filtered);
    });

    // Carousel scrolling
    prevBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: -200, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: 200, behavior: 'smooth' });
    });

    // Export
    exportBtn.addEventListener('click', exportToLua);

    // Save state on select changes
    jobSelect.addEventListener('change', saveState);

    // Modal listeners
    modalConfirm.addEventListener('click', () => {
        if (pendingDrop) {
            const action = { ...pendingDrop.baseAction, customTarget: modalTargetSelect.value };
            finalizeDrop(action, null, pendingDrop.targetSlot);
            pendingDrop = null;
            modalOverlay.classList.add('hidden');
        }
    });

    modalCancel.addEventListener('click', () => {
        pendingDrop = null;
        modalOverlay.classList.add('hidden');
    });

    // Help Modal listeners
    helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
    });

    helpClose.addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });
}

function saveState() {
    localStorage.setItem('xivhotbar_state', JSON.stringify(hotbarState));
    localStorage.setItem('xivhotbar_job', jobSelect.value);
}

function loadState() {
    const savedState = localStorage.getItem('xivhotbar_state');
    if (savedState) {
        hotbarState = JSON.parse(savedState);
    }
    const savedJob = localStorage.getItem('xivhotbar_job');
    if (savedJob) {
        jobSelect.value = savedJob;
    }
}

// Export logic
function exportToLua() {
    let luaStr = `-- Generated by XIVHotbar Builder\n`;
    luaStr += `xivhotbar_keybinds_job['Base'] = {\n`;

    for (let i = 1; i <= 4; i++) {
        const barHasItems = hotbarState[i].some(item => item !== null);
        if (barHasItems) {
            luaStr += `    -- Hotbar #${i}\n`;
            for (let j = 0; j < 12; j++) {
                const action = hotbarState[i][j];
                if (action) {
                    // Format: {'b Hotbar Slot', 'Type', 'Name', 'Target', 'Alias'}
                    // We generate a short alias from the name if none exists
                    const alias = action.name.substring(0, 4) + '.';
                    const target = action.customTarget || 't';
                    luaStr += `    {'b ${i} ${j + 1}', '${action.type}', '${action.name}', '${target}', '${alias}'},\n`;
                }
            }
        }
    }
    
    luaStr += `}\n\nreturn xivhotbar_keybinds_job\n`;

    const selectedJob = jobSelect.value || 'xivhotbar_layout';

    // Download Job Blob
    const blob = new Blob([luaStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedJob}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Generate General.lua
    const generalLuaStr = `xivhotbar_keybinds_general['Root'] = {\n}\nreturn xivhotbar_keybinds_general\n`;
    
    // Download General Blob
    const generalBlob = new Blob([generalLuaStr], { type: 'text/plain' });
    const generalUrl = URL.createObjectURL(generalBlob);
    const generalA = document.createElement('a');
    generalA.href = generalUrl;
    generalA.download = `General.lua`;
    document.body.appendChild(generalA);
    // Slight delay to ensure the browser doesn't block the second download
    setTimeout(() => {
        generalA.click();
        document.body.removeChild(generalA);
        URL.revokeObjectURL(generalUrl);
    }, 100);
}

// Start
init();
