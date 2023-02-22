const fs = require('fs/promises');
const cmd = process.argv[2];
const help = `Usage :-\n$ ./task add 2 hello world    # Add a new item with priority 2 and text \"hello world\" to the list\n$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order\n$ ./task del INDEX            # Delete the incomplete item with the given index\n$ ./task done INDEX           # Mark the incomplete item with the given index as complete\n$ ./task help                 # Show usage\n$ ./task report               # Statistics`;
main();

async function main() {
    if (cmd === 'add') {
        const priority = process.argv[3];
        const task = process.argv[4];
        if (priority >= 0 && task?.length > 1)
            await addTask({ task, priority });
        else
            console.log('Error: Missing tasks string. Nothing added!');
    } else if (cmd === 'del') {
        const index = process.argv[3];
        if (!index) {
            console.log('Error: Missing NUMBER for deleting tasks.')
        }
        if (await deleteTask(index)) {
            console.log(`Deleted task #${index}`);
        } else {
            console.log(`Error: task with index #${index} does not exist. Nothing deleted.`);
        }

    } else if (cmd === 'done') {
        const index = process.argv[3];
        if (!index) {
            console.log('Error: Missing NUMBER for marking tasks as done.')
        }
        if (await completeTask(index)) {
            console.log(`Marked item as done.`);
        } else {
            console.log(`Error: no incomplete item with index #${index} exists.`);
        }

    } else if (cmd === 'ls') {
        const pendingTasks = await getPendingTasks();
        if (pendingTasks.length > 0) {
            pendingTasks.forEach((item, index) => {
                console.log(`${index + 1}. ${item.task} [${item.priority}]`);
            })
        } else {
            console.log('There are no pending tasks!');
        }
    } else if (cmd === 'report') {
        await printReport();
    } else {
        console.log(help);
    }
}

async function addTask({ task, priority }) {
    try {
        await fs.writeFile('task.txt', priority + ' ' + task + '\n', { flag: 'a+' });
        console.log(`Added task: "${task}" with priority ${priority}`);
    } catch (err) {

    }
}

async function completeTask(index) {
    try {
        const tasks = await getPendingTasks();
        if (index-1 >= 0 && index-1 < tasks.length) {
            await fs.writeFile('completed.txt', tasks[index - 1].task + '\n', { flag: 'a+' });
            await deleteTask(index);
            return true;
        } else {
            return false;
        }
    } catch (err) {

    }
}

async function deleteTask(index) {
    try {
        const tasks = await getPendingTasks();
        if (index-1 >= 0 && index-1 < tasks.length) {
            let data = await fs.readFile('task.txt', { encoding: 'utf8' });
            data = data.replace(tasks[index - 1].priority + ' ' + tasks[index - 1].task + '\n', '');
            await fs.writeFile('task.txt', data);
            return true;
        } else {
            return false;
        }
    } catch (err) {
    }
}

async function getPendingTasks() {
    try {
        const data = await fs.readFile('task.txt', { encoding: 'utf8' });
        const tasks = data.split("\n").slice(0, -1).map((item, index) => {
            const priority = item[0];
            const task = item.slice(2);
            return { priority, task };
        }).sort((a, b) => {
            return a.priority - b.priority;
        })
        return tasks;
    } catch (err) {
        return [];
    }
}

async function getCompletedTasks() {
    try {
        const data = await fs.readFile('completed.txt', { encoding: 'utf8' });
        const tasks = data.split("\n").slice(0, -1);
        return tasks;
    } catch (err) {
        return [];
    }
}

async function printReport() {
    try {
        const pendingTasks = await getPendingTasks();
        console.log('Pending :', pendingTasks.length);
        pendingTasks.forEach((item, index) => {
            console.log(`${index + 1}. ${item.task} [${item.priority}]`);
        })
        const completedTasks = await getCompletedTasks();
        console.log('\nCompleted :', completedTasks.length);
        completedTasks.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
        })
    } catch (err) {

    }
}





