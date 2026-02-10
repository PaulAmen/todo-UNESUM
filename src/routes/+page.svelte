<script>
    import { taskStore } from '$lib/state.svelte.js';
    import TaskCard from '$lib/components/TaskCard.svelte';

    let filter = $state('todos'); 
    let searchQuery = $state('');
    
    let filteredTasks = $derived(
        taskStore.tasks.filter(t => {
            const matchesFilter = filter === 'todos' || t.estado === filter;
            const matchesSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 t.resumen.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit() {
        if(!formTask.titulo.trim()) return;
        
        const taskData = {
            ...formTask,
            estado: editingTask ? editingTask.estado : 'pendiente',
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
        
        openAdd();
    }
</script>

<div class="min-h-screen bg-[#020617] p-4 md:p-8 font-sans text-slate-200">
    <div class="max-w-6xl mx-auto">
        <header class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-1">
                 <h1 class="text-4xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    UNESUM Tasks
                 </h1>
                 <p class="text-slate-500 text-sm font-medium tracking-wide">TASK MANAGEMENT SYSTEM</p>
            </div>
            
             <div class="flex flex-wrap gap-1.5 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
                {#each ['todos', 'pendiente', 'completado'] as f}
                    <button 
                        class="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 {filter === f ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}"
                        onclick={() => filter = f}
                    >
                        {f}
                    </button>
                {/each}
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <!-- Left: Form -->
            <div class="lg:col-span-5 space-y-6">
                <div class="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 backdrop-blur-md shadow-2xl sticky top-8">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-xl font-bold text-white flex items-center gap-3">
                            <span class="w-2 h-8 bg-blue-500 rounded-full"></span>
                            {editingTask ? 'Editar Registro' : 'Nuevo Registro'}
                        </h2>
                        {#if editingTask}
                            <button onclick={openAdd} class="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">Cancelar</button>
                        {/if}
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
                                <select id="type" bind:value={formTask.tipo} class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none">
                                    <option value="tarea">Tarea</option>
                                    <option value="reunion">Reunión</option>
                                    <option value="informativo">Info</option>
                                    <option value="spam">Spam</option>
                                </select>
                            </div>
                            <div>
                                <label for="priority" class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Prioridad</label>
                                <select id="priority" bind:value={formTask.prioridad} class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none">
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baja">Baja</option>
                                </select>
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

            <!-- Right: Search + List -->
            <div class="lg:col-span-7 space-y-6">
                <!-- Search Bar -->
                <div class="relative group">
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
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {#each filteredTasks as task (task.id)}
                             <TaskCard {task} onedit={openEdit} />
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    :global(body) {
        background-color: #020617;
    }
</style>
