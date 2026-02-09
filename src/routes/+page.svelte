<script>
    import { taskStore } from '$lib/state.svelte.js';
    import TaskCard from '$lib/components/TaskCard.svelte';

    let filter = $state('todos'); 
    let searchQuery = $state('');
    
    // Filtering logic using $derived (Filter + Search)
    let filteredTasks = $derived(
        taskStore.tasks.filter(t => {
            const matchesFilter = filter === 'todos' || t.estado === filter;
            const matchesSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 t.resumen.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        })
    );
    
    // Editor State
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
        formTask = {
            titulo: '',
            tipo: 'tarea',
            prioridad: 'media',
            resumen: '',
            accion_sugerida: ''
        };
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
        // Scroll to form or show modal? For now, we'll keep the form at top or in a modal-like overlay
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
        
        openAdd(); // Reset form
    }
</script>

<div class="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
    <div class="max-w-6xl mx-auto">
        <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Task Dashboard</h1>
            </div>
            
             <div class="flex flex-wrap gap-2 bg-white p-1 rounded-xl border shadow-sm self-start md:self-auto">
                {#each ['todos', 'pendiente', 'completado'] as f}
                    <button 
                        class="px-4 py-2 rounded-lg text-sm capitalize transition-all duration-200 {filter === f ? 'bg-blue-600 text-white shadow-md font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
                        onclick={() => filter = f}
                    >
                        {f}
                    </button>
                {/each}
            </div>
        </header>

        <!-- Search and Form Area -->
        <div class="space-y-4 mb-8">
            <!-- Search Bar -->
            <div class="relative group">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input 
                    type="text" 
                    placeholder="Buscar por título o resumen..." 
                    bind:value={searchQuery}
                    class="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            <!-- Form (Editor/Add) -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-bold text-lg text-gray-700">
                        {editingTask ? '📝 Editar Tarea' : '➕ Nueva Tarea'}
                    </h2>
                    {#if editingTask}
                        <button onclick={openAdd} class="text-xs text-gray-400 hover:text-red-500 font-medium">Cancelar edición</button>
                    {/if}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div class="md:col-span-2">
                        <label for="title" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Título</label>
                        <input 
                            id="title"
                            type="text" 
                            bind:value={formTask.titulo} 
                            class="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="¿Qué hay que hacer?"
                        />
                    </div>
                    <div>
                        <label for="type" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                        <select id="type" bind:value={formTask.tipo} class="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="tarea">Tarea</option>
                            <option value="reunion">Reunión</option>
                            <option value="informativo">Info</option>
                            <option value="spam">Spam</option>
                        </select>
                    </div>
                    <div>
                        <label for="priority" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prioridad</label>
                        <select id="priority" bind:value={formTask.prioridad} class="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="resumen" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Resumen / Descripción</label>
                        <textarea 
                            id="resumen"
                            bind:value={formTask.resumen}
                            rows="2"
                            class="w-full border-gray-200 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Detalles adicionales..."
                        ></textarea>
                    </div>
                    <div>
                        <label for="accion" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Acción Sugerida</label>
                        <input 
                            id="accion"
                            type="text" 
                            bind:value={formTask.accion_sugerida}
                            class="w-full border-gray-200 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ej: Llamar a Juan"
                        />
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button 
                        onclick={handleSubmit}
                        disabled={!formTask.titulo.trim()}
                        class="px-8 py-3 bg-blue-600 disabled:bg-blue-300 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg active:scale-95"
                    >
                        {editingTask ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </button>
                </div>
            </div>
        </div>

        {#if taskStore.loading}
            <div class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        {:else if taskStore.error}
            <div class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error: {taskStore.error}</span>
            </div>
        {:else if filteredTasks.length === 0}
            <div class="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                <p>No se encontraron tareas que coincidan.</p>
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