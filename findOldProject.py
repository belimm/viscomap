import urllib.parse

def findOld(db,urlAddress,Depth,session):
    alreadyExist = 0
    counter = 0
    alreadyFlag = 0
    oldProjects = db.child("projects").get()
    for project in oldProjects.each():
        projectKey = project.key()
        projectNumber = db.child("projects").child(projectKey).get()
        print(projectNumber.key())
        for projectnumber in projectNumber.each():
            #print(projectnumber.key())
            if counter == 2:
                counter = 0
                alreadyExist = 0
            if projectnumber.key() == "Depth":
                if int(projectnumber.val()) == int(Depth):
                    alreadyExist += 1      
            if urllib.parse.unquote(projectnumber.key()).replace("%2E","." ) == urlAddress:
                alreadyExist += 1
            if alreadyExist == 2:
                counter = 0
                alreadyExist = 0
                oldKey = projectNumber.key()
                print(oldKey)
                alreadyFlag = 1
                db.child("users").child(session).child("projects").child(projectNumber.key()).set(projectnumber.key())
                break
            counter += 1

    if alreadyFlag:
        return True
    else:
        return False
    