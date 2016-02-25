﻿module BABYLON.EDITOR.GUI {

    var gridButtons = w2obj.grid.prototype.buttons;
    gridButtons["add"].caption = w2utils.lang("");
    gridButtons["delete"].caption = w2utils.lang("");

    export class GUIGrid<T> extends GUIElement<W2UI.IGridElement<T>> {
        // Public members
        public columns: Array<W2UI.IGridColumnData> = [];
        public header: string = "New Grid";
        public showToolbar: boolean = true;
        public showFooter: boolean = false;
        public showDelete: boolean = false;
        public showAdd: boolean = false;
        public showEdit: boolean = false;
        public showOptions: boolean = true;
        public showSearch: boolean = true;
        public menus: W2UI.IGridMenu[] = [];

        public onClick: (selected: number[]) => void;
        public onMenuClick: (id: string) => void;
        public onDelete: (selected: number[]) => void;
        public onAdd: () => void;
        public onEdit: (selected: number[]) => void;

        // Private members

        /**
        * Constructor
        * @param name: the form name
        * @param core: the editor core
        */
        constructor(name: string, core: EditorCore) {
            super(name, core);
        }

        // Adds a menu
        public addMenu(id: number, text: string, icon: string): void {
            this.menus.push({
                id: id,
                text: text,
                icon: icon
            });
        }

        // Creates a column
        public createColumn(id: string, text: string, size?: string): void {
            if (!size)
                size = "50%";

            this.columns.push({ field: id, caption: text, size: size });
        }

        // Adds a row and refreshes the grid
        public addRow(data: T): void {
            (<any>data).recid = this.getRowCount();
            this.element.add(data);
        }

        // Adds a record without refreshing the grid
        public addRecord(data: T): void {
            (<any>data).recid = this.element.records.length;
            this.element.records.push(data);
        }

        // Removes a row and refreshes the list
        public removeRow(recid: number): void {
            this.element.remove(recid);
        }

        // Removes a record, need to refresh the list after
        public removeRecord(recid: number): void {
            this.element.records.splice(recid, 1);
        }

        // Refresh the element (W2UI)
        public refresh(): void {
            for (var i = 0; i < this.element.records.length; i++) {
                (<any>this.element).records[i].recid = i;
            }

            super.refresh();
        }

        // Returns the number of rows
        public getRowCount(): number {
            return this.element.total;
        }

        // Clear
        public clear(): void {
            this.element.clear();
            this.element.total = 0;
        }

        // Locks the grid
        public lock(message: string, spinner?: boolean): void {
            this.element.lock(message, spinner);
        }

        // Unlock the grid
        public unlock(): void {
            this.element.unlock();
        }

        // Returns the selected rows
        public getSelectedRows(): number[] {
            return this.element.getSelection();
        }

        // sets the selected rows
        public setSelected(selected: number[]): void {
            for (var i = 0; i < selected.length; i++) {
                this.element.select(selected[i]);
            }
        }

        // Returns the row at indice
        public getRow(indice: number): T {
            if (indice >= 0) {
                return this.element.get(indice);
            }

            return null;
        }
        
        // Modifies the row at indice
        public modifyRow(indice: number, data: T): void {
            this.element.set(indice, data);
        }

        // Build element
        public buildElement(parent: string): void {
            this.element = (<any>$("#" + parent)).w2grid({
                name: this.name,

                show: {
                    toolbar: this.showToolbar,
                    footer: this.showFooter,
                    toolbarDelete: this.showDelete,
                    toolbarAdd: this.showAdd,
                    toolbarEdit: this.showEdit,
                    toolbarSearch: this.showSearch,
                    toolbarColumns: this.showOptions,
                    header: !(this.header === "")
                },

                menu: this.menus,

                header: this.header,
                columns: this.columns,
                records: [],

                onClick: (event: any) => {
                    event.onComplete = () => {
                        var selected = this.getSelectedRows();
                        if (selected.length === 1) {
                            if (this.onClick)
                                this.onClick(selected);

                            var ev = new Event();
                            ev.eventType = EventType.GUI_EVENT;
                            ev.guiEvent = new GUIEvent(this, GUIEventType.GRID_SELECTED, selected);
                            this.core.sendEvent(ev);
                        }
                    }
                },

                keyboard: false,

                onMenuClick: (event: any) => {
                    if (this.onMenuClick)
                        this.onMenuClick(event.menuItem.id);

                    var ev = new Event();
                    ev.eventType = EventType.GUI_EVENT;
                    ev.guiEvent = new GUIEvent(this, GUIEventType.GRID_MENU_SELECTED, event.menuItem.id);
                    this.core.sendEvent(ev);
                },

                onDelete: (event: any) => {
                    if (event.force) {
                        var data = this.getSelectedRows();

                        if (this.onDelete)
                            this.onDelete(data);

                        var ev = new Event();
                        ev.eventType = EventType.GUI_EVENT;
                        ev.guiEvent = new GUIEvent(this, GUIEventType.GRID_ROW_REMOVED, data);
                        this.core.sendEvent(ev);
                    }
                },

                onAdd: (event) => {
                    if (this.onAdd)
                        this.onAdd();

                    var ev = new Event();
                    ev.eventType = EventType.GUI_EVENT;
                    ev.guiEvent = new GUIEvent(this, GUIEventType.GRID_ROW_ADDED);
                    this.core.sendEvent(ev);
                },

                onEdit: (event) => {
                    var data = this.getSelectedRows();

                    if (this.onEdit)
                        this.onEdit(data);

                    var ev = new Event();
                    ev.eventType = EventType.GUI_EVENT;
                    ev.guiEvent = new GUIEvent(this, GUIEventType.GRID_ROW_EDITED, data);
                    this.core.sendEvent(ev);
                }
            });
        }
    }
}