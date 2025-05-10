import type React from 'react';
import type { TaskProps } from '../interfaces/TaskProps';

interface TaskCardProps {
    task: TaskProps;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    return (
        <div className='bg-background p-4 rounded-lg'>
            <div className='flex flex-col gap-1'>
                <div className='flex'>
                    <div></div>
                    <input type='checkbox' className='mr-2' checked={task.completed} id={task.title} />
                    <label htmlFor={task.title} className='xl:text-xl font-bold'>
                        {task.title}
                    </label>
                    {task.completed && <span className='text-green-500 ml-2'>✓</span>}
                </div>
                {task.completed && (
                    <span className='text-[0.65rem]'>
                        <strong>Concluído em: </strong>
                        {task.completedAt}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
