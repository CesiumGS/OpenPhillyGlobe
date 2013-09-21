import json
import os
import argparse

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Convert all txt files in a directory to json')
    parser.add_argument('dir', metavar='d',
                       help='Directory Name')
    parser.add_argument('ext', metavar='x',
                       help='File extension of csv files')


    args = parser.parse_args()
    os.chdir(args.dir)
    for filename in os.listdir(os.getcwd()):
        if os.path.isfile(filename) and args.ext in os.path.splitext(filename)[-1]:
            print filename
            fin = open(filename)
            lines = fin.readlines()
            fin.close()
            jsonData = []
            header = lines[0].split(',')
            for i in range(1,len(lines)):
                row = lines[i].split(',')
                d = {}
                for j in range(len(row)):
                    d[header[j]] = row[j]
                jsonData.append(d)
            newFilename = os.path.splitext(filename)[0] + '.json'
            json.dump(jsonData, open(newFilename, 'w'))
