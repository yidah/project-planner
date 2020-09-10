class DOMHelper{
  static clearEventListeneres(element){
    const clonedElement = element.cloneNode(true);
    // Clonning the element with itself we ditch any old event handlers so no memory leaks when adding new event handlers to the button
    element.replaceWith(clonedElement);
    return clonedElement;

  }
    static moveElement(elementId, newDestinationSelector){
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);

    }
}

class Tooltip {

}

class ProjectItem {
  constructor(id, updateProjectListsFunciton, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunciton;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
  }

  connectMoreInfoButton() {}

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchBtn = projectItemElement.querySelector('button:last-of-type');
    // In case this button had already an event handler we clear it to avoid memory leaks and errors
    switchBtn = DOMHelper.clearEventListeneres(switchBtn);
    // If project was moved update button text
    switchBtn.textContent = type === 'active' ? 'Finish':'Activate';
    // updateProjectListsHandler points to the switchProject function in ProjectList class
    switchBtn.addEventListener('click', this.updateProjectListsHandler.bind(null,this.id));
  }

  update(updateProjectListsFun, type){
    this.updateProjectListsHandler = updateProjectListsFun;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${this.type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type));
    }
    console.log(this.projects);
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
      // "this" was set in init() and corresponds not to the list that the project currently belongs but the other
      this.projects.push(project);
      DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
      // We update the project with a new handler as now it belongs to the "this" list
      project.update(this.switchProject.bind(this), this.type);

  }

  // This method is sent as the function to be called when activate or finished button is click
  // and the  lets us communicate  with the ProjectItem class see ProjectList Constructor and updateProjectListsHandler in ProjectItem class
  switchProject(projectId) {
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    const activeProjectsList = new ProjectList('active');
    const finishedProjectsList = new ProjectList('finished');
    // Active projects need to be added to the finished list the handler will point to the addProject funciton 
    // and "this" will be de finishedProjectsList when the function is called
    activeProjectsList.setSwitchHandlerFunction(
      finishedProjectsList.addProject.bind(finishedProjectsList)
    );
    // Finished projects need to be added to the active list the handler will point to the addProject funciton 
    // and "this" will be de activeProjectsList when the function is called
    finishedProjectsList.setSwitchHandlerFunction(
      activeProjectsList.addProject.bind(activeProjectsList)
    );
  }
}

App.init();
