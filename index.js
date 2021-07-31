const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mysql = require('mysql2')
const options={
 cors:true,
 origins:["http://127.0.0.1:3000"],
}
const { Server } = require("socket.io");
const io = new Server(server, options);
const cors = require('cors');

var mysqlConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'django',
    password: '',
    database: 'booctop',
    multipleStatements: true
});

app.use(cors())

mysqlConnection.connect( err => {
  if (!err) {
    app.get('/', (req, res) => {
      res.send('<h1>Hello world</h1>');
    });

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

      socket.on('add_course', (data) =>{
        console.log("add_course ::", data)
        socket.broadcast.emit('add_course_complete', {
          user: data.user,
          course_id: data.course_id
        })
      })

      socket.on('add_test_video', (data) =>{
        console.log("add_test_video ::", data)
        socket.broadcast.emit('add_test_video_complete', {
          user: data.user_id,
          id: data.id
        })
      })

      socket.on('add_noti_admin', (data) =>{
        console.log("add_noti_admin ::", data)
        socket.broadcast.emit('course_noti_from_admin', {
          title: data.title,
          content: data.content,
          course_id: data.course_id,
          user_id: data.user_id
        })
      })

      socket.on('add_noti_testvideo_admin', (data) =>{
        console.log("add_noti_testvideo_admin ::", data)
        socket.broadcast.emit('video_noti_from_admin', {
          title: data.title,
          content: data.content,
          video_id: data.course,
          user_id: data.user
        })
      })

      socket.on('set_course_approve', (data) =>{
        console.log("set_course_approve ::", data)
        socket.broadcast.emit('set_course_approve_to_user', {
          title: data.title,
          content: data.content,
          course_id: data.course_id,
          user_id: data.user_id 
        })
      })

      socket.on('set_course_cancel', (data) =>{
        console.log("set_course_cancel ::", data)
        socket.broadcast.emit('set_course_cancel_to_user', {
          title: data.title,
          content: data.content,
          course_id: data.course_id,
          user_id: data.user_id 
        })
      })

      socket.on('send_noti_to_employee', (data) =>{
        console.log("send_noti_to_employee ::", data)
        socket.broadcast.emit('send_noti_to_employee_reply', {
          title: data.title,
          content: data.content,
          good_bad: data.good_bad,
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        mysqlConnection.query(`insert into admin_notifications (title, content, sender_id, receiver_id, time, is_read, good_bad) values ("${data.title}","${data.content}","${data.sender_id}","${data.receiver_id}","${time_format}",0,"${data.good_bad}")`)
      })

      socket.on('send_noti_to_teacher_all', (data) =>{
        console.log("send_noti_to_teacher_all ::", data)
        socket.broadcast.emit('send_noti_to_teacher_all_reply', {
          title: data.noti_title,
          content: data.noti_content,
          sender_id: data.sender_id
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        //for admin part sender is BOOCTEP.COM and course is ignored so i put this as 999, 1
        mysqlConnection.query(`select * from home_user where group_id > 1`, (err, res) =>{
          let query = `insert into home_notifications (user_id, title, text, is_read, course_id, sender_id, created_at, type) values `
          if (!err){
            let key = 1
            res.forEach(item =>{
              query += `("${item.id}","${data.noti_title}","${data.noti_content}", 0, 999, "${data.sender_id}","${time_format}", 1)`
              if (key < res.length)
                query += `,`
              else 
                query += `;`
              key ++
            })
            mysqlConnection.query(query)
          }
        })
      })

      socket.on('send_noti_to_teacher', (data) =>{
        console.log("send_noti_to_teacher ::", data)
        socket.broadcast.emit('send_noti_to_teacher_reply', {
          receiver_id: data.receiver_id,
          sender_id: data.sender_id,
          title: data.noti_title,
          content: data.noti_content,
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        //for admin part sender is BOOCTEP.COM and course is ignored so i put this as 999, 1
        mysqlConnection.query(`insert into home_notifications (user_id, title, text, is_read, course_id, sender_id, created_at, type) values ("${data.receiver_id}","${data.noti_title}","${data.noti_content}", 0, 999, "${data.sender_id}","${time_format}", 1)`)
      })

      socket.on('send_noti_to_student_all', (data) =>{
        console.log("send_noti_to_student_all ::", data)
        socket.broadcast.emit('send_noti_to_student_all_reply', {
          title: data.title,
          content: data.content,
          sender_id: data.sender_id
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        //for admin part sender is BOOCTEP.COM and course is ignored so i put this as 999, 1
        mysqlConnection.query(`select * from home_user where group_id = 1`, (err, res) =>{
          let query = `insert into home_notifications (user_id, title, text, is_read, course_id, sender_id, created_at, type) values `
          if (!err){
            let key = 1
            res.forEach(item =>{
              query += `("${item.id}","${data.title}","${data.content}", 0, 999, "${data.sender_id}","${time_format}", 1)`
              if (key < res.length)
                query += `,`
              else 
                query += `;`
              key ++
            })
            mysqlConnection.query(query)
          }
        })
      })

      socket.on('send_noti_to_student', (data) =>{
        console.log("send_noti_to_student ::", data)
        socket.broadcast.emit('send_noti_to_student_reply', {
          receiver_id: data.receiver_id,
          sender_id: data.sender_id,
          title: data.title,
          content: data.content,
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        //for admin part sender is BOOCTEP.COM and course is ignored so i put this as 999, 1
        mysqlConnection.query(`insert into home_notifications (user_id, title, text, is_read, course_id, sender_id, created_at, type) values ("${data.receiver_id}","${data.title}","${data.content}", 0, 999, "${data.sender_id}","${time_format}", 1)`)
      })

      /****
        booctep message part..
      ***/

      socket.on('teacher_to_student_message', (data) =>{
        console.log("teacher_to_student_message ::", data)
        socket.broadcast.emit('teacher_to_student_message_reply', {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          time: data.time,
          text: data.text,
          course_id: data.course_id,
          course_name: data.course_name
        })
        mysqlConnection.query(`insert into home_messages (sender_id, receiver_id, course_id, text, time) values ("${data.sender_id}","${data.receiver_id}", "${data.course_id}", "${data.text}", "${data.time}")`)
      })

      socket.on('student_to_teacher_message', (data) =>{
        console.log("student_to_teacher_message ::", data)
        socket.broadcast.emit('student_to_teacher_message_reply', {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          time: data.time,
          text: data.text,
          course_id: data.course_id,
          course_name: data.course_name
        })
        mysqlConnection.query(`insert into home_messages (sender_id, receiver_id, course_id, text, time) values ("${data.sender_id}","${data.receiver_id}", "${data.course_id}" ,"${data.text}","${data.time}")`)
      })

      socket.on('teacher_to_student_notification', (data) =>{
        console.log("teacher_to_student_notification ::", data)
        socket.broadcast.emit('teacher_to_student_notification_reply', {
          sender_id: data.sender_id,
          course_id: data.course_id,
          content: data.content,
          title: data.title,
          sender_name: data.sender_name
        })
        time = new Date().toISOString()
        time_format = time.slice(0,10) + " " + time.slice(11,19)
        mysqlConnection.query(`select * from student_student_register_courses where course_id_id = ${data.course_id}`, (err, res)=>{
          let query = `insert into home_notifications (user_id, title, text, is_read, course_id, sender_id, created_at, type) values `
          if(!err) {
            let key = 1;
            res.forEach(item =>{
              query += `("${item.student_id_id}","${data.title}","${data.content}",0,"${data.course_id}","${data.sender_id}","${time_format}",0)`
              if (key < res.length)
                query += `,`
              else 
                query += `;`
              key ++
            })
	    console.log("query::", query)
            mysqlConnection.query(query)
          }
        })
      })

    });

    server.listen(3000, () => {
      console.log('listening on *:3000');
    });
  } else {
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
  }
})



