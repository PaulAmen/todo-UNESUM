<script>
    import { taskStore } from '$lib/state.svelte.js';
    let { task, onedit } = $props();

    const priorityColors = {
        alta: 'border-red-500/30 bg-red-500/10 text-red-400',
        media: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        baja: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    };

    let colorClass = $derived(priorityColors[task.prioridad] || 'border-slate-700 bg-slate-800/50 text-slate-400');

    function formatDisplayDate(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function formatDisplayTime(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Prioritize datos_evento if they look like clean strings, otherwise fallback to formatted fecha_creacion
    let dateToShow = $derived(
        (task.datos_evento?.fecha && task.datos_evento.fecha.length < 15) 
        ? task.datos_evento.fecha 
        : formatDisplayDate(task.fecha_creacion || task.datos_evento?.fecha)
    );
    
    let timeToShow = $derived(
        (task.datos_evento?.hora && task.datos_evento.hora.length < 10)
        ? task.datos_evento.hora
        : formatDisplayTime(task.fecha_creacion || task.datos_evento?.fecha)
    );
</script>

<div class="group relative bg-slate-900 border {colorClass} rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-opacity-100 flex flex-col gap-3">
    <div class="flex justify-between items-start gap-2">
        <h3 class="font-bold text-lg text-slate-100 line-clamp-2 leading-tight group-hover:text-white">
            {task.titulo}
        </h3>
        <span class="shrink-0 text-[10px] uppercase px-2 py-1 rounded-md border border-inherit font-bold tracking-widest bg-black/20">
            {task.tipo}
        </span>
    </div>
    
    <p class="text-sm text-slate-400 line-clamp-3 leading-relaxed">
        {task.resumen}
    </p>
    
    {#if task.accion_sugerida}
        <div class="flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/5 py-2 px-3 rounded-lg border border-indigo-500/10">
            <span class="animate-pulse">✨</span> {task.accion_sugerida}
        </div>
    {/if}

    <div class="text-xs text-slate-300 flex items-center gap-1.5 font-semibold bg-white/5 py-1 px-2 rounded-lg w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{dateToShow || 'No date'}</span> 
        <span class="text-slate-600">|</span> 
        <span>{timeToShow || 'No time'}</span>
    </div>

    <div class="mt-4 pt-4 border-t border-slate-800/50 flex gap-2 items-center">
        <button 
            onclick={() => taskStore.toggleComplete(task)}
            class="px-4 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-semibold active:scale-95"
        >
            {(task.estado === 'completed' || task.estado === 'completado') ? 'Reopen' : 'Complete'}
        </button>

        <button 
            onclick={() => onedit(task)}
            class="px-4 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-semibold active:scale-95"
        >
            Edit
        </button>
        
        <div class="ml-auto flex items-center gap-1">
             <button 
                 onclick={() => taskStore.deleteTask(task.id)}
                 class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                 title="Delete"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
</div>
