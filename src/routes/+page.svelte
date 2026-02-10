<script>
    import { taskStore, authStore } from '$lib/state.svelte.js';
    import TaskCard from '$lib/components/TaskCard.svelte';

    let filter = $state('pending'); 
    let searchQuery = $state('');
    let isFormOpen = $state(false);
    
    // Auth Effect: Init taskStore when user is available
    $effect(() => {
        if (authStore.user) {
            taskStore.init();
        }
    });

    let filteredTasks = $derived(
        taskStore.tasks
            .filter(t => {
                // Normalize status to handle transition from Spanish to English
                const currentStatus = t.estado === 'pendiente' ? 'pending' : 
                                    t.estado === 'completado' ? 'completed' : t.estado;
                
                const matchesFilter = filter === 'all' || currentStatus === filter;
                const matchesSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     t.resumen.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => {
                const statusA = a.estado === 'pendiente' ? 'pending' : a.estado;
                const statusB = b.estado === 'pendiente' ? 'pending' : b.estado;
                
                if (statusA === 'pending' && statusB === 'completed') return -1;
                if (statusA === 'completed' && statusB === 'pending') return 1;
                return 0;
            })
    );
    
    let editingTask = $state(null);
    let formTask = $state({
        titulo: '',
        tipo: 'tarea',
        prioridad: 'media',
        resumen: '',
        accion_sugerida: ''
    });

    function openAdd() {
        editingTask = null;
        formTask = { titulo: '', tipo: 'tarea', prioridad: 'media', resumen: '', accion_sugerida: '' };
        isFormOpen = true;
    }

    function openEdit(task) {
        editingTask = task;
        formTask = {
            titulo: task.titulo,
            tipo: task.tipo,
            prioridad: task.prioridad,
            resumen: task.resumen || '',
            accion_sugerida: task.accion_sugerida || ''
        };
        isFormOpen = true;
    }

    async function handleSubmit() {
        if(!formTask.titulo.trim()) return;
        
        const taskData = {
            ...formTask,
            estado: editingTask ? editingTask.estado : 'pending',
            datos_evento: editingTask ? editingTask.datos_evento : {
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        };

        if (editingTask) {
            await taskStore.updateTask(editingTask.id, taskData);
        } else {
            await taskStore.addTask(taskData);
        }
        
        isFormOpen = false;
        editingTask = null;
        formTask = { titulo: '', tipo: 'tarea', prioridad: 'media', resumen: '', accion_sugerida: '' };
    }
</script>

{#if authStore.user === undefined}
    <!-- Loading State -->
    <div class="min-h-screen bg-[#020617] flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
{:else if authStore.user === null}
    <!-- Login Screen -->
    <div class="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl text-center space-y-8">
            <div class="space-y-2">
                <h1 class="text-4xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    UNESUM Tasks
                </h1>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Acceso Restringido</p>
            </div>
            
            <div class="py-4">
                <p class="text-slate-400 text-sm leading-relaxed">
                    Este sistema es privado. Inicia sesión con Google para verificar tu identidad.
                </p>
            </div>

            <button 
                onclick={() => authStore.login()}
                class="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
            </button>
            
            <p class="text-[10px] text-slate-600 font-medium uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
    </div>
{:else}
    <!-- Authorized Dashboard -->
    <div class="min-h-screen bg-[#020617] p-4 md:p-8 font-sans text-slate-200 pb-24">
        <div class="max-w-6xl mx-auto">
            <header class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="space-y-1">
                    <h1 class="text-4xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        UNESUM Tasks
                    </h1>
                    <div class="flex items-center gap-3">
                        <p class="text-slate-500 text-sm font-medium tracking-wide">TASK MANAGEMENT SYSTEM</p>
                        <span class="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <button onclick={() => authStore.logout()} class="text-[10px] font-bold text-red-500/70 hover:text-red-400 uppercase tracking-widest transition-colors">Cerrar Sesión</button>
                    </div>
                </div>
                
                <div class="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
                    {#each ['pending', 'completed', 'all'] as f}
                        <button 
                            class="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-300 whitespace-nowrap {filter === f ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}"
                            onclick={() => filter = f}
                        >
                            {f}
                        </button>
                    {/each}
                </div>
            </header>

            <div class="space-y-6">
                <!-- Search Bar -->
                <div class="relative group max-w-2xl mx-auto w-full">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Buscar en el ecosistema..." 
                        bind:value={searchQuery}
                        class="w-full bg-slate-900/40 border border-slate-800 rounded-[2rem] py-5 pl-14 pr-6 text-white shadow-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-600 backdrop-blur-md"
                    />
                </div>

                {#if taskStore.loading}
                    <div class="flex flex-col items-center justify-center py-32 space-y-4">
                        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sincronizando con Firestore</p>
                    </div>
                {:else if taskStore.error}
                    <div class="bg-red-500/10 text-red-400 p-6 rounded-3xl border border-red-500/20 flex items-center gap-4">
                        <span class="text-2xl">⚠️</span>
                        <div class="text-sm font-medium">Error de sistema: {taskStore.error}</div>
                    </div>
                {:else if filteredTasks.length === 0}
                    <div class="text-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800/50">
                        <div class="text-4xl mb-4 opacity-20">🧊</div>
                        <p class="text-slate-500 font-medium italic">El vacío es absoluto. No hay registros.</p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {#each filteredTasks as task (task.id)}
                             <TaskCard {task} onedit={openEdit} />
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Floating Action Button -->
    <button 
        onclick={openAdd}
        class="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all duration-300 z-40 flex items-center justify-center"
        title="Nuevo Registro"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    </button>

    <!-- Modal Overlay -->
    {#if isFormOpen}
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        {editingTask ? 'Editar Registro' : 'Nuevo Registro'}
                    </h2>
                    <button onclick={() => { isFormOpen = false; editingTask = null; }} class="p-2 text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="space-y-5">
                    <div class="group">
                        <label for="title" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Título del Proyecto</label>
                        <input 
                            id="title"
                            type="text" 
                            bind:value={formTask.titulo} 
                            class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                            placeholder="Ej: Implementar Auth"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="type" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Categoría</label>
                            <div class="relative">
                                <select id="type" bind:value={formTask.tipo} class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none">
                                    <option value="tarea">Tarea</option>
                                    <option value="reunion">Reunión</option>
                                    <option value="informativo">Info</option>
                                    <option value="spam">Spam</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label for="priority" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Prioridad</label>
                            <div class="relative">
                                <select id="priority" bind:value={formTask.prioridad} class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none">
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baja">Baja</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="resumen" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Descripción Detallada</label>
                        <textarea 
                            id="resumen"
                            bind:value={formTask.resumen}
                            rows="3"
                            class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder-slate-700"
                            placeholder="Describe los puntos clave..."
                        ></textarea>
                    </div>

                    <div>
                        <label for="accion" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Acción Inmediata</label>
                        <input 
                            id="accion"
                            type="text" 
                            bind:value={formTask.accion_sugerida}
                            class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                            placeholder="Ej: Contactar al equipo"
                        />
                    </div>

                    <button 
                        onclick={handleSubmit}
                        disabled={!formTask.titulo.trim()}
                        class="w-full mt-4 py-4 bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl hover:bg-blue-500 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                    >
                        {editingTask ? 'Guardar Cambios' : 'Registrar Tarea'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
{/if}

<style>
    :global(body) {
        background-color: #020617;
    }
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
