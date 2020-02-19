import os
import random
import time
from functions import Functions
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def login_csc(driver, name, pwd):
    driver.get(os.environ['CATALYST_SERVER'])
    driver.find_element_by_xpath(
        '//*[@id="csc-login-form"]//div//input[@type="text"]'
    ).send_keys(name)
    driver.find_element_by_xpath(
        '//*[@id="csc-login-form"]//div//input[@type="password"]'
    ).send_keys(pwd)
    driver.find_element_by_xpath(
        '//*[@id="csc-login"]//div//button').click()


def logout_csc(driver):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="csc-header-toolbar"]/div[1]/button')))
    driver.find_element_by_xpath(
        '//*[@id="csc-header-toolbar"]/div[1]/button').click()
    driver.find_element_by_xpath(
        '/html/body//div[contains(text(), "Logout")]').click()


def login_panel(driver):
    driver.get(os.environ['CATALYST_SERVER'] + ":1443/logout")
    driver.get(os.environ['CATALYST_SERVER'] + ":1443")
    driver.find_element_by_xpath(
        '//*[@id="username"]').send_keys('administrator')
    driver.find_element_by_xpath(
        '//*[@id="password"]').send_keys('administrator')
    driver.find_element_by_xpath('//*[@id="submit"]').click()


def logout_panel(driver):
    driver.find_element_by_xpath(
        '//*[@id="top-nav"]/ul//a[contains(text(), "Logout")]').click()


def create_customer(driver, name=None):
    if not name:
        name = 'customer' + str(random.randint(1, 100000)) + 'test'
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    driver.find_element_by_link_text('Create Customer').click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="contactidtable"]//tr[1]//td/input')))
    Functions.scroll_to_element(
        driver, '//*[@id="contactidtable"]//tr[1]//td/input')
    driver.find_element_by_xpath(
        '//*[@id="contactidtable"]//tr[1]//td/input').click()
    Functions.scroll_to_element(
        driver, '//*[@id="billing_profileidtable"]//tr[1]//td/input')
    driver.find_element_by_xpath(
        '//*[@id="billing_profileidtable"]//tr[1]//td/input').click()
    Functions.scroll_to_element(
        driver, '//*[@id="external_id"]')
    Functions.fill_element(
        driver, '//*[@id="external_id"]', name)
    driver.find_element_by_xpath('//*[@id="save"]').click()
    return name


def delete_customer(driver, name):
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input',
        'thisshouldnotexist')
    driver.find_element_by_css_selector(
        '#Customer_table tr > td.dataTables_empty')
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input', name)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="Customer_table"]//tr[1]//td'
        '[text()="%s"]' % name)))
    Functions.move_and_click(
        driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(),'
        ' "Terminate")]')
    driver.find_element_by_xpath('//*[@id="dataConfirmOK"]').click()


def create_subscriber(driver, customername, domainname):
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input',
        'thisshouldnotexist')
    driver.find_element_by_css_selector(
        '#Customer_table tr > td.dataTables_empty')
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input', customername)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="Customer_table"]//tr[1]//td'
        '[text()="%s"]' % customername)))
    Functions.move_and_click(
        driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(),'
        ' "Details")]')
    driver.find_element_by_link_text('Expand Groups').click()
    Functions.scroll_to_element(driver, 'Subscribers')
    driver.find_element_by_link_text("Create Subscriber").click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
        (By.XPATH, '//*[@id="domainidtable_paginate"]/a[4]')))
    Functions.fill_element(
        driver, '//*[@id="domainidtable_filter"]//input',
        'thisshouldnotexist')
    driver.find_element_by_css_selector(
        '#domainidtable tr > td.dataTables_empty')
    Functions.fill_element(
        driver, '//*[@id="domainidtable_filter"]//input', domainname)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="domainidtable"]//tr[1]//td'
        '[text()="%s"]' % domainname)))
    Functions.click_js(
        driver, '//*[@id="domainidtable"]/tbody/tr[1]/td[4]/input')
    driver.find_element_by_xpath(
        '//*[@id="webusername"]').send_keys('testuser')
    driver.find_element_by_xpath(
        '//*[@id="webpassword"]').send_keys('testpasswd')
    driver.find_element_by_xpath(
        '//*[@id="username"]').send_keys('testuser')
    driver.find_element_by_xpath(
        '//*[@id="password"]').send_keys('testpasswd')
    driver.find_element_by_xpath('//*[@id="save"]').click()


def delete_subscriber(driver, customername):
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Customers').click()
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input',
        'thisshouldnotexist')
    driver.find_element_by_css_selector(
        '#Customer_table tr > td.dataTables_empty')
    Functions.fill_element(
        driver, '//*[@id="Customer_table_filter"]//input', customername)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="Customer_table"]//tr[1]//td'
        '[text()="%s"]' % customername)))
    Functions.move_and_click(
        driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(),'
        ' "Details")]')
    driver.find_element_by_link_text('Expand Groups').click()
    Functions.scroll_to_element(driver, 'Subscribers')
    Functions.move_and_click(
        driver, '//*[@id="subscribers_table"]//tr[1]//td//a[contains(text(), '
        '"Terminate")]')
    driver.find_element_by_xpath('//*[@id="dataConfirmOK"]').click()


def create_domain(driver, name=None):
    if not name:
        name = 'domain' + str(random.randint(1, 100000)) + 'test'
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Domains').click()
    driver.find_element_by_link_text('Create Domain').click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="reselleridtable"]//tr[1]/td[5]/input')))
    driver.find_element_by_xpath(
        '//*[@id="reselleridtable"]//tr[1]/td[5]/input').click()
    Functions.fill_element(driver, '//*[@id="domain"]', name)
    driver.find_element_by_xpath('//*[@id="save"]').click()
    return name


def delete_domain(driver, name):
    driver.find_element_by_xpath(
        '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element_by_link_text('Domains').click()
    Functions.fill_element(
        driver, '//*[@id="Domain_table_filter"]//input',
        'thisshouldnotexist')
    driver.find_element_by_css_selector(
        '#Domain_table tr > td.dataTables_empty')
    Functions.fill_element(
        driver, '//*[@id="Domain_table_filter"]//input', name)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
        By.XPATH, '//*[@id="Domain_table"]//tr[1]//td[text()="%s"]' % name)))
    Functions.move_and_click(
        driver, '//*[@id="Domain_table"]//tr[1]//td//a[contains(text(),'
        ' "Delete")]')
    driver.find_element_by_xpath('//*[@id="dataConfirmOK"]').click()
