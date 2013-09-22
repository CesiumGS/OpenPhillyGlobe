import urllib2
import os

if __name__ == "__main__":

    fin = open('../Assets/google_bus/source/routes.txt', 'r')
    lines = fin.readlines()
    fin.close()

    for line in lines:
        row = line.split(',')
        routeNum = row[1]
        response = urllib2.urlopen('http://www3.septa.org/transitview/kml/%s.kml' % routeNum)
        htmlresponse = response.read()
    
        if '/kml' in htmlresponse:
            fout = open('%s.kml' % routeNum, 'w')
            fout.write(htmlresponse)
            fout.close()