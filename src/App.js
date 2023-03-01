import React, { Component } from 'react';
import 'toastr/build/toastr.min.css';
import { fromJS } from 'immutable'
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import './style.scss';
import Column from './components/Column/';
import Task from './components/Task/';

class App extends Component {

  state = {
    displayModal: false,
    editingColumnIndex: '',
    taskContent: '',
    editingTaskIndex: null,
    editedTaskId: null,
    columns: fromJS([
      { id: 'doing', title: 'DOING', tasks: [{id: '1', content: 'Demo task', time: '04/15/2019, 9:25:35 PM'}, 
                                          {id: '2', content: 'Design task', time: '04/12/2019, 9:25:35 PM'}]},
      { id: 'inprogress', title: 'IN PROGRESS', tasks: [{id: '3', content: 'Doing task', time: '04/10/2019, 9:25:35 PM'},
                                                {id: '4', content: 'Deploy task', time: '04/10/2019, 9:25:35 PM'}]},
      { id: 'completed', title: 'COMPLETED', tasks: [{id: '5', content: 'Testing task', time: '04/09/2019, 9:25:35 PM'},
                                              {id: '6', content: 'Feedback task', time: '04/08/2019, 9:25:35 PM'}]}
    ])
  }

  componentDidMount() {
    const columns = localStorage.getItem('columns');
    if (columns) {
      this.setState({ columns: fromJS(JSON.parse(columns)) });
    }
  }

  handleToggleModal = (choosenColumn = '') => () => {
    this.setState(prevState => ({
      displayModal: !prevState.displayModal,
      editingColumnIndex: choosenColumn
    }));
  }

  handleChangeTaskContent = (e) => this.setState({ taskContent: e.target.value })

  handleChangeeditingColumnIndex = (editingColumnIndex) => () => this.setState({ editingColumnIndex: editingColumnIndex })

  handleSaveDrag = (result) => {
    const { source, destination, reason } = result;
    if (reason === 'DROP' && destination) {
      const { columns } = this.state;
      const sourceColumnIndex = columns.findIndex(column => column.get('id') === source.droppableId);
      const task = columns.getIn([sourceColumnIndex, 'tasks', source.index]);
      let updatedColumn = columns.updateIn(
        [sourceColumnIndex, 'tasks'],
        tasks => tasks.remove(source.index)
      );
      const destinationColumnIndex = columns.findIndex(column => column.get('id') === destination.droppableId);
      updatedColumn = updatedColumn.updateIn(
        [destinationColumnIndex, 'tasks'],
        tasks => tasks.insert(destination.index, task)
      );
      this.setState({
        columns: fromJS(updatedColumn)
      }, () => {
        localStorage.setItem('columns', JSON.stringify(updatedColumn.toJS()));
      });
    }
  }

  render() {
    const { columns } = this.state;

    return (
      <div className="App">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#news">Project Management</a></li>
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn">Services</a>
              <div class="dropdown-content">
                <a href="#">Services 1</a>
                <a href="#">Services 2</a>
                <a href="#">Services 3</a>
              </div>
            </li>
          </ul>
          
        <hr></hr>
        <h1 className="App__title">Kanban Board</h1>
        <DragDropContext onDragEnd={this.handleSaveDrag}>
          <div className="App__content">
            {
              columns.map((column) => (
                <Column key={column.get('id')}
                  column={column}
                  handleAddNewTask={this.handleToggleModal}
                >
                  <Droppable droppableId={column.get('id')}>
                    {
                      provided => (
                        <div ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ minHeight: '300px', 
                          backgroundColor: '#1c1e21'}}
                        >
                          {
                            column.get('tasks').map((task, taskIndex) => (
                              <Task key={task.get('id')}
                                index={taskIndex}
                                task={task} />
                            ))
                          }
                          {provided.placeholder}
                        </div>
                      )
                    }
                  </Droppable>
                </Column>
              ))
            }
          </div>
        </DragDropContext>
      </div>
    );
  }
}

export default App;
