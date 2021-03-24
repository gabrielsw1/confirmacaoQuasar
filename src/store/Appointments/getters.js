export function GetAppointmentsSelected (state) {
    return state.appointmentsSelectds
}
export function GetCountAppointmentsSelected (state) {
    return state.appointmentsSelectds.length
}
export function GetIdAppointmentsSelected (state) {
    let ExpandedObject =[]
    state.appointmentsSelectds.forEach(element => {
        let obj ={}
        obj[element.idAgendamento] = false
        ExpandedObject.push(obj)
    });
    return ExpandedObject
} 
