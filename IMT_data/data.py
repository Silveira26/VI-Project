import csv
import os
import tabula
import pandas as pd

def get_files_name():
    """
    Gets all files from the folders
    """
    files = {}
    for folder in ['2015', '2016', '2017', '2018', '2019', '2020', '2021']:
        files[folder] = []
        for file in os.listdir("rough_data/"+folder):
            if file.endswith(".pdf"):
                files[folder].append(file)
    return files

def convert_files(filesName):
    """
    Converts all pdf files to csv in a folder that starts with "csv"
    """
    for folder in filesName:
        for file in filesName[folder]:
            # Convert PDF to DataFrame
            df = tabula.read_pdf("rough_data/"+ folder + '/' + file, pages='all')[0]
            
            # Get headers and data
            headers = df.columns.tolist()
            data = df.values.tolist()
            
            # Write headers and data to CSV
            csv_file_path = "clean_data/" + folder + '/' + file.replace('.pdf', '.csv')
            with open(csv_file_path, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(headers)
                writer.writerows(data)

def remove_csv_files(filesName):
    """
    Removes all csv files in a folder that starts with "csv"
    """
    for folder in filesName:
        for file in filesName["clean_data/"+ folder]:
            if file.endswith(".csv"):
                os.remove("clean_data/"+ folder + '/' + file)

# Example usage:
files = get_files_name()
#remove_csv_files(files)
convert_files(files)