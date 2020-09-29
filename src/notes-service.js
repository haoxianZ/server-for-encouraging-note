const NotesService = {
    getAll(knex){
        return knex.select('*').from('notes')
    },
    insertNote(knex, newNote){
        return knex.insert(newNote).into('notes').returning('*').then(rows => {return rows[0]})
    },
    getById(knex,id){
        return knex.select('*').from('notes').where('id',id).first()
    },
    deleteById(knex,id){
        return knex('notes').where({id}).delete()
    },
    updateNote(knex,id, updateNote){
        return knex('notes').where({id}).update(updateNote)
    }
}
module.exports =  NotesService